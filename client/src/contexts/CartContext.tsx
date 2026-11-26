import React, { createContext, useContext, useEffect, useState } from "react";
import type { Order } from "@/lib/orders";
import type { PayMethod } from "@/lib/payMethods";

export type CartItem = {
  id: string; // variant ID
  categoryName: string;
  productName: string;
  flavor?: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  updateSize: (id: string, oldSize: string, newSize: string) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  deliveryFee: number;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  /** street and number */
  shippingDetails: string;
  setShippingDetails: (details: string) => void;
  city: string;
  setCity: (city: string) => void;
  apartment: string;
  setApartment: (apartment: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  email: string;
  setEmail: (email: string) => void;
  /** the email typed a second time; must match */
  emailAgain: string;
  setEmailAgain: (email: string) => void;
  /* Checkout state shared by the cart drawer and the Order section, so both always show
     the same errors and an order being sent from one can't be sent again from the other */
  tried: boolean;
  setTried: (tried: boolean) => void;
  touched: Record<string, boolean>;
  touch: (field: string) => void;
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  /** "I'm 18 or over": asked only when the bag holds alcohol */
  adult: boolean;
  setAdult: (adult: boolean) => void;
  payMethod: PayMethod;
  setPayMethod: (m: PayMethod) => void;
  /** The order just placed: the same "Order placed" screen in the cart and the Order section */
  placed: Order | null;
  setPlaced: (order: Order | null) => void;
  updatePlaced: (change: Partial<Order>) => void;
  /** the phone dropped the page before they paid (e.g. while in the Bit app): show it again */
  placedRestored: boolean;
};

/* The "Order placed" screen survives the phone dropping the page while the
   customer is in the Bit or PayBox app: kept in this tab, for two hours. */
const PLACED_KEY = "shweet-brew-placed";
function readPlaced(): Order | null {
  try {
    const p = JSON.parse(sessionStorage.getItem(PLACED_KEY) || "null");
    return p?.reference && Date.now() - Date.parse(p.createdAt) < 2 * 3600000 ? p : null;
  } catch {
    return null;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingDetails, setShippingDetails] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [apartment, setApartment] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailAgain, setEmailAgain] = useState<string>("");
  const [tried, setTried] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) => setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  const [submitting, setSubmitting] = useState(false);
  const [adult, setAdult] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>("bit_paybox");
  const [placed, setPlaced] = useState<Order | null>(readPlaced);
  const [placedRestored] = useState(() => !!placed && !placed.claimed && placed.payMethod === "bit_paybox");
  const updatePlaced = (change: Partial<Order>) => setPlaced((o) => (o ? { ...o, ...change } : o));
  useEffect(() => {
    try {
      if (placed) sessionStorage.setItem(PLACED_KEY, JSON.stringify(placed));
      else sessionStorage.removeItem(PLACED_KEY);
    } catch {
      // private browsing: the confirmation email has it all too
    }
  }, [placed]);

  // An empty bag (order placed, or everything removed) starts the next checkout without old errors
  const bagEmpty = items.length === 0;
  useEffect(() => {
    if (!bagEmpty) {
      setPlaced(null); // a new bag after an order
      return;
    }
    setTried(false);
    setTouched({});
    setAdult(false);
  }, [bagEmpty]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id && item.size === newItem.size);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id && item.size === newItem.size
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string, size: string) => {
    setItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size);
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id && item.size === size ? { ...item, quantity } : item
        )
      );
    }
  };

  const updateSize = (id: string, oldSize: string, newSize: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === oldSize ? { ...item, size: newSize } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setShippingDetails("");
    setNotes("");
    setSelectedArea("");
    setName("");
    setPhone("");
    setCity("");
    setApartment("");
    setEmail("");
    setEmailAgain("");
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (selectedArea ? 0 : 0); // Will be updated in CartPanel

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateSize,
        clearCart,
        total: subtotal,
        subtotal,
        deliveryFee: 0,
        selectedArea,
        setSelectedArea,
        name,
        setName,
        phone,
        setPhone,
        shippingDetails,
        setShippingDetails,
        city,
        setCity,
        apartment,
        setApartment,
        notes,
        setNotes,
        email,
        setEmail,
        emailAgain,
        setEmailAgain,
        tried,
        setTried,
        touched,
        touch,
        submitting,
        setSubmitting,
        adult,
        setAdult,
        payMethod,
        setPayMethod,
        placed,
        setPlaced,
        updatePlaced,
        placedRestored,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
