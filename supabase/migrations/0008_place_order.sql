-- ===========================================================================
-- 0008 · place_order()
--
-- The only way to create an order from the website (called by
-- client/src/lib/orders.ts). Takes the cart as JSON, looks every price up in
-- the database (prices from the browser are ignored), checks availability and
-- stock, applies the zone's fee and minimum, takes the stock and returns the
-- reference.
--
-- Input:
-- {
--   "name": "Dana", "phone": "054...", "email": null,
--   "zone_id": "zone_1_tel_aviv",
--   "city": "Tel Aviv", "street": "Dizengoff 1", "apartment": "Apt 4",
--   "notes": "", "language": "he",
--   "requested_delivery_date": "2026-11-23",
--   "items": [ { "product_id": "biltong-traditional", "size": "250g", "quantity": 2 } ]
-- }
-- Admins may also pass "source": "whatsapp" | "phone" | "admin" to log an order
-- taken elsewhere (no minimum, no flood guard).
--
-- Errors (stable message prefixes the site translates):
--   INVALID_INPUT:<field>   BELOW_MINIMUM:<min>   TOO_MANY_ORDERS
--   UNAVAILABLE:<product_id>:<size>   OUT_OF_STOCK:<product_id>:<size>:<left>
-- ===========================================================================

create or replace function public.place_order(p_order jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin     boolean := public.is_admin();
  v_name      text := left(trim(coalesce(p_order ->> 'name', '')), 120);
  v_phone     text := left(trim(coalesce(p_order ->> 'phone', '')), 30);
  v_email     text := nullif(left(trim(coalesce(p_order ->> 'email', '')), 200), '');
  v_zone_id   text := p_order ->> 'zone_id';
  v_lang      text := case when p_order ->> 'language' = 'he' then 'he' else 'en' end;
  v_source    text := coalesce(p_order ->> 'source', 'website');
  v_req_date  date;
  v_zone      public.delivery_zones%rowtype;
  v_line      record;
  v_subtotal  numeric(10, 2) := 0;
  v_fee       numeric(10, 2);
  v_total     numeric(10, 2);
  v_order     public.orders%rowtype;
  v_count     integer;
begin
  -- Customer details
  if length(v_name) < 2 then raise exception 'INVALID_INPUT:name'; end if;
  if v_phone !~ '^\+?[0-9][0-9 ()\-]{6,24}$' then raise exception 'INVALID_INPUT:phone'; end if;
  if v_email is not null and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'INVALID_INPUT:email'; end if;
  if not v_admin and v_source <> 'website' then v_source := 'website'; end if;
  if v_source not in ('website', 'whatsapp', 'phone', 'admin') then raise exception 'INVALID_INPUT:source'; end if;

  select * into v_zone from public.delivery_zones where id = v_zone_id and is_active;
  if not found then raise exception 'INVALID_INPUT:zone_id'; end if;

  begin
    v_req_date := (p_order ->> 'requested_delivery_date')::date;
  exception when others then
    v_req_date := null;
  end;
  if v_req_date is not null and v_req_date < (now() at time zone 'Asia/Jerusalem')::date then
    v_req_date := null;
  end if;

  -- Flood guard: at most 5 website orders per phone number in 10 minutes
  if not v_admin then
    select count(*) into v_count
    from public.orders
    where phone = v_phone and created_at > now() - interval '10 minutes';
    if v_count >= 5 then raise exception 'TOO_MANY_ORDERS'; end if;
  end if;

  -- Cart lines
  if jsonb_typeof(p_order -> 'items') is distinct from 'array'
     or jsonb_array_length(p_order -> 'items') = 0
     or jsonb_array_length(p_order -> 'items') > 60 then
    raise exception 'INVALID_INPUT:items';
  end if;

  create temporary table if not exists _cart (
    size_id uuid, product_id text, product_name text, category_name text,
    size_label text, unit_price numeric(10, 2), stock integer, quantity integer
  ) on commit drop;
  truncate pg_temp._cart;

  -- Merge duplicate lines, then lock the matching size rows in a fixed order,
  -- so two orders for the same packs queue up instead of deadlocking or both
  -- taking the last pack
  for v_line in
    select i.product_id, i.size, sum(i.quantity)::int as quantity
    from jsonb_to_recordset(p_order -> 'items') as i (product_id text, size text, quantity int)
    group by i.product_id, i.size
    order by i.product_id, i.size
  loop
    if v_line.product_id is null or v_line.size is null
       or v_line.quantity is null or v_line.quantity < 1 or v_line.quantity > 200 then
      raise exception 'INVALID_INPUT:items';
    end if;

    insert into pg_temp._cart
    select ps.id, p.id, p.name_en, c.name_en, ps.label, ps.price, ps.stock, v_line.quantity
    from public.product_sizes ps
    join public.products p on p.id = ps.product_id
    join public.categories c on c.id = p.category_id
    where ps.product_id = v_line.product_id
      and ps.label = v_line.size
      and ps.is_active and p.is_available and c.is_active
    for update of ps;

    if not found then
      raise exception 'UNAVAILABLE:%:%', v_line.product_id, v_line.size;
    end if;
  end loop;

  for v_line in select * from pg_temp._cart order by size_id loop
    if v_line.stock is not null and v_line.stock < v_line.quantity then
      raise exception 'OUT_OF_STOCK:%:%:%', v_line.product_id, v_line.size_label, v_line.stock;
    end if;
    v_subtotal := v_subtotal + v_line.unit_price * v_line.quantity;
  end loop;

  if not v_admin and v_subtotal < v_zone.min_order then
    raise exception 'BELOW_MINIMUM:%', v_zone.min_order;
  end if;

  v_fee := v_zone.fee;
  v_total := v_subtotal + coalesce(v_fee, 0);

  insert into public.orders (
    user_id, source, customer_name, phone, email, zone_id, zone_name,
    city, street, apartment, notes, language,
    subtotal, delivery_fee, total, requested_delivery_date
  ) values (
    (select auth.uid()), v_source, v_name, v_phone, v_email, v_zone.id, v_zone.name_en,
    nullif(left(trim(coalesce(p_order ->> 'city', '')), 120), ''),
    nullif(left(trim(coalesce(p_order ->> 'street', '')), 200), ''),
    nullif(left(trim(coalesce(p_order ->> 'apartment', '')), 120), ''),
    nullif(left(trim(coalesce(p_order ->> 'notes', '')), 1000), ''),
    v_lang, v_subtotal, v_fee, v_total, v_req_date
  )
  returning * into v_order;

  insert into public.order_items (order_id, product_id, size_id, product_name, category_name, size_label, unit_price, quantity)
  select v_order.id, product_id, size_id, product_name, category_name, size_label, unit_price, quantity
  from pg_temp._cart;

  -- Take the stock (logged by the trigger from 0006)
  perform set_config('shweetbrew.stock_reason', 'order', true);
  perform set_config('shweetbrew.stock_order_id', v_order.id::text, true);
  perform set_config('shweetbrew.stock_note', 'Order ' || v_order.reference, true);
  update public.product_sizes ps
  set stock = ps.stock - c.quantity
  from pg_temp._cart c
  where ps.id = c.size_id and ps.stock is not null;
  perform set_config('shweetbrew.stock_reason', '', true);
  perform set_config('shweetbrew.stock_order_id', '', true);
  perform set_config('shweetbrew.stock_note', '', true);

  return jsonb_build_object(
    'id', v_order.id,
    'reference', v_order.reference,
    'status', v_order.status,
    'subtotal', v_order.subtotal,
    'delivery_fee', v_order.delivery_fee,
    'total', v_order.total,
    'created_at', v_order.created_at
  );
end;
$$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
