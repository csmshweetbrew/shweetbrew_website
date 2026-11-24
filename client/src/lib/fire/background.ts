/*
 * "INTO THE FIRE" PAGE BACKGROUND
 *
 * Runs behind the whole page. At the top it is cool, slow smoke; the further you scroll, the
 * warmer it gets, with more sparks, until the braai at the bottom (see braai.ts).
 *
 * Cheap by design: one canvas at half the screen size, 30 times a second (slower while the braai
 * covers it), and nothing while the tab is hidden. Reduced motion: a still picture that only follows scrolling.
 */

import { createGL, createProgram, createTriangle, reducedMotion, Sparks, type Program } from "./gl";

const SHADER = `
uniform float t,as,pg,sy;
float smoke(vec2 q){vec2 w=vec2(fb(q*1.5+vec2(0.,-t*.2)),fb(q*1.5+vec2(5.2,-t*.17)));return smoothstep(.36,.9,fb(q*vec2(2.3,1.25)+w*2.4+vec2(0.,-t*.34)));}
void main(){
  float deep=smoothstep(.06,1.,pg);
  vec2 q=vec2(u.x*as,u.y-sy*.35);
  vec3 c=vec3(.0353,.0275,.0235);
  float s=smoke(q);
  c+=mix(vec3(.15,.137,.128),vec3(.26,.075,.022),deep)*s*(.75-.2*deep)*(.5+.5*(1.-u.y*.5));
  float rise=exp(-u.y*mix(5.5,2.3,deep));
  c+=vec3(.34,.062,.010)*rise*deep*(.6+.4*fb(vec2(u.x*3.,t*.35)));
  c+=(h1(gl_FragCoord.xy+fract(t))-.5)/220.;
  o=vec4(c,1.);
}`;

export function startFireBackground(canvas: HTMLCanvasElement): () => void {
  const still = reducedMotion();
  let gl = createGL(canvas, false);
  let prog: Program | null = null;
  let triangle = () => {};
  let w = 1, h = 1, progress = -1, scrollY = window.scrollY, t = 0, last = 0, due = 0, carry = 0, raf = 0, stopped = false;
  const sparks = new Sparks(140);
  const SCALE = 0.5;

  const build = () => {
    if (!gl) return;
    try {
      prog = createProgram(gl, SHADER);
      triangle = createTriangle(gl);
      sparks.build(gl);
    } catch (e) {
      console.warn("Fire background is off:", e);
      prog = null;
    }
  };

  const size = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.max(2, Math.round(w * SCALE));
    canvas.height = Math.max(2, Math.round(h * SCALE));
  };

  const target = () => Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.documentElement.scrollHeight - h)));

  const paint = () => {
    if (!gl || !prog || gl.isContextLost()) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prog.program);
    gl.uniform1f(prog.loc("t"), t);
    gl.uniform1f(prog.loc("as"), w / h);
    gl.uniform1f(prog.loc("pg"), progress);
    gl.uniform1f(prog.loc("sy"), scrollY / h);
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
    carry += dt * (0.6 + progress * 7 + progress * progress * 20);
    while (carry > 1) {
      carry--;
      sparks.add(Math.random() * w, h + 10, (Math.random() - 0.5) * 50, -(70 + Math.random() * 190), 1.8 + Math.random() * 3, 0.8 + Math.random() * 0.5);
    }
    sparks.move(dt, shift * 0.6);
    due -= dt;
    if (due <= 0 || (moved && progress < 0.9)) { due = progress > 0.9 ? 1 / 16 : 1 / 30; paint(); }
  };

  const onLost = (e: Event) => { e.preventDefault(); prog = null; };
  const onRestored = () => { gl = createGL(canvas, false); build(); paint(); };
  const onResize = () => { size(); paint(); };

  build();
  size();
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  window.addEventListener("resize", onResize, { passive: true });
  raf = requestAnimationFrame(frame);

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
    window.removeEventListener("resize", onResize);
  };
}
