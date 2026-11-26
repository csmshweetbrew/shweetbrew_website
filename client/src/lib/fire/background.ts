/*
 * "INTO THE FIRE" PAGE BACKGROUND
 *
 * Runs behind the whole page. At the top it is cool, slow smoke, with a few brighter wisps in the hero
 * (the hero photo is blended over it, see .hero-backdrop) that moving across blows aside; the further you scroll, the
 * warmer it gets, with more sparks, until the braai at the bottom. There it is also the sky: the
 * braai's picture has none (see braai.ts).
 *
 * Cheap by design: one small canvas, 30 times a second (20 near the braai), noise read from a
 * texture, and nothing while the tab is hidden. Reduced motion: a still picture that only follows scrolling.
 */

import { createGL, createNoiseTexture, createProgramAsync, createTriangle, reducedMotion, Sparks, type Program } from "./gl";

const SHADER = `
uniform float t,as,pg,sy,drift;
float h1(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float smoke(vec2 q){vec2 w=vec2(fb(q*1.5+vec2(0.,-t*.2)),fb(q*1.5+vec2(5.2,-t*.17)));return smoothstep(.36,.9,fb(q*vec2(2.3,1.25)+w*2.4+vec2(0.,-t*.34)));}
void main(){
  float deep=smoothstep(.06,1.,pg);
  vec2 q=vec2(u.x*as,u.y-sy*.35);
  vec3 c=vec3(.0353,.0275,.0235);
  float s=smoke(q);
  c+=mix(vec3(.15,.137,.128),vec3(.26,.075,.022),deep)*s*(.75-.2*deep)*(.5+.5*(1.-u.y*.5));
  float rise=exp(-u.y*mix(5.5,2.3,deep));
  c+=vec3(.34,.062,.010)*rise*deep*(.6+.4*fb(vec2(u.x*3.,t*.35)));
  /* wisps in the hero: thin, rising from behind the tiles */
  float hero=1.-smoothstep(.15,.95,sy);
  if(hero>.01){
    float y=u.y-sy;vec2 p=vec2((u.x-.5)*as-drift*(.35+.9*u.y)-.10*sin(y*2.6+t*.16),y);
    vec2 v=vec2(fb(p*vec2(1.5,.9)+vec2(2.,-t*.10)),fb(p*vec2(1.5,.9)+vec2(7.4,-t*.085)))-.5;
    float f=fb(p*vec2(2.5,.95)+v*2.5+vec2(0.,-t*.23));float wisp=1.-smoothstep(.0,.115,abs(f-.47));
    wisp*=smoothstep(.34,.66,fb(p*vec2(1.2,.7)+vec2(4.,-t*.12)));
    float body=smoothstep(.44,.86,fb(p*vec2(1.5,.75)+v*2.1+vec2(9.,-t*.17)));
    float place=smoothstep(-.02,.22,u.y)*(1.-.60*smoothstep(.42,.95,u.y));
    c+=mix(vec3(.235,.165,.120),vec3(.150,.142,.140),u.y)*(wisp*.62+body*.62)*place*hero;}
  c+=(h1(gl_FragCoord.xy+fract(t))-.5)/220.;
  o=vec4(c,1.);
}`;

export function startFireBackground(canvas: HTMLCanvasElement): () => void {
  const still = reducedMotion();
  let gl = createGL(canvas, false);
  let prog: Program | null = null;
  let triangle = () => {};
  let noise: WebGLTexture | null = null;
  let w = 1, h = 1, progress = -1, scrollY = window.scrollY, t = 0, last = 0, due = 0, carry = 0, raf = 0, stopped = false;
  let drift = 0, gust = 0, lastX = -1; // the hero's smoke, blown aside
  const sparks = new Sparks(110);
  const SCALE = 0.4;

  const build = async () => {
    if (!gl) return;
    try {
      const ready = await createProgramAsync(gl, SHADER);
      if (stopped) return;
      noise = createNoiseTexture(gl);
      triangle = createTriangle(gl);
      sparks.build(gl);
      prog = ready;
      due = 0;
    } catch (e) {
      console.warn("Fire background is off:", e);
      prog = null;
    }
  };

  /** The canvas's own box (.fire-bg), not the window: on iPhones the window's height changes with Safari's bars. True if it changed. */
  const size = () => {
    const nw = canvas.clientWidth || window.innerWidth, nh = canvas.clientHeight || window.innerHeight;
    if (nw === w && nh === h) return false;
    w = nw;
    h = nh;
    canvas.width = Math.max(2, Math.round(w * SCALE));
    canvas.height = Math.max(2, Math.round(h * SCALE));
    return true;
  };

  const target = () => Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)));

  const paint = () => {
    if (!gl || !prog || gl.isContextLost()) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prog.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, noise);
    gl.uniform1i(prog.loc("nz"), 0);
    gl.uniform1f(prog.loc("t"), t);
    gl.uniform1f(prog.loc("as"), w / h);
    gl.uniform1f(prog.loc("pg"), progress);
    gl.uniform1f(prog.loc("sy"), scrollY / h);
    gl.uniform1f(prog.loc("drift"), drift);
    triangle();
    sparks.draw(w, h, SCALE);
  };

  const frame = (now: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const y = window.scrollY;
    const shift = Math.abs(y - scrollY) < h ? scrollY - y : 0;
    const moved = y !== scrollY;
    scrollY = y;
    const goal = target();
    progress = progress < 0 ? goal : progress + (goal - progress) * Math.min(1, dt * 5);

    if (still) {
      if (moved || due === 0) { due = 1; progress = goal; paint(); }
      return;
    }
    t += dt;
    gust *= Math.exp(-dt * 1.1);
    drift += gust * dt;
    carry += dt * (0.5 + progress * 6 + progress * progress * 16);
    while (carry > 1) {
      carry--;
      sparks.add(Math.random() * w, h + 10, (Math.random() - 0.5) * 50, -(70 + Math.random() * 190), 1.8 + Math.random() * 3, 0.8 + Math.random() * 0.5);
    }
    sparks.move(dt, shift * 0.6);
    due -= dt;
    if (due <= dt * 0.5) { due = progress > 0.93 ? 1 / 20 : 1 / 30; paint(); }
  };

  const onLost = (e: Event) => { e.preventDefault(); prog = null; };
  const onRestored = () => { gl = createGL(canvas, false); void build(); };
  const onResize = () => { if (size()) paint(); };
  const onMove = (e: PointerEvent) => {
    const x = e.clientX / w;
    if (lastX >= 0 && scrollY < h) gust = Math.max(-0.5, Math.min(0.5, gust + Math.max(-0.08, Math.min(0.08, x - lastX)) * 1.6));
    lastX = x;
  };

  void build();
  size();
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  window.addEventListener("resize", onResize, { passive: true });
  if (!still) window.addEventListener("pointermove", onMove, { passive: true });
  raf = requestAnimationFrame(frame);

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onMove);
  };
}
