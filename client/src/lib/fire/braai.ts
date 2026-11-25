/*
 * THE STEEL BRAAI (bottom of the page)
 *
 * The scene was rendered once, offline, with real light and shadow (a steel braai, boerewors and other beef in wire
 * baskets, Table Mountain left, Jerusalem right). It has no sky: the canvas is see-through there, so the page's own smoke
 * and sparks (background.ts) show behind the mountain and the leaves, and the page and the picture are one place.
 *
 * Its pictures (images/fire/) keep the light apart: base = the low sun, fire = the firelight, shares = how much of it comes
 * from each flame, masks = in front of the flames / scene / leaves, and the hanging tongs with their mask. Two steps:
 * the lit scene is drawn into a texture about 16 times a second (firelight flickers no faster), and every frame only the
 * flames, smoke, leaves, tongs and sparks are added. Moving over it makes a breeze; a click or tap blows on the fire.
 *
 * Light on purpose: it runs only on screen, and a device that can't hold 60 frames a second gets a little less sharpness
 * and then an even 30. Reduced motion: one still picture. Beef only (kosher). How to render the pictures again: HANDOFF.md.
 */

import { Embers } from "./embers";
import { createFlames, FLAME_LOOK, type Flames } from "./flames";
import { createGL, createNoiseTexture, createProgramAsync, createTriangle, reducedMotion, type Program } from "./gl";

type Vec3 = [number, number, number];
/* The cameras the pictures were rendered with: don't change one without rendering again. hook = what the tongs hang from; tongs = where
   their cut-out sits; post = the post stands above the picture's edge and fades out there. */
type Shot = { name: string; w: number; h: number; eye: Vec3; target: Vec3; zoom: number; hook: Vec3; tongs: [number, number, number, number]; post: number };
const WIDE: Shot = { name: "wide", w: 2112, h: 1080, eye: [0.1, 1.41, 2.45], target: [0, 1.12, 0], zoom: 1.48, hook: [1, 1.003, 0.455], tongs: [0.69981, 0.45, 0.25047, 0.55], post: 1 };
const PHONE: Shot = { name: "phone", w: 900, h: 1080, eye: [0.05, 1.66, 2.68], target: [0, 1.1, 0], zoom: 1.16, hook: [0.4, 0.76, 0.462], tongs: [0.55, 0.5, 0.3, 0.5], post: 0 };
const NAMES = ["base", "fire", "shares", "masks", "tongs", "tongs-mask"];
const GRADE: Vec3 = [0.8, 0.54, 0.42], FIRE = 1.25; // the sun made redder, the fire stronger, to match the page
const EXT = 0.34; // how far the canvas reaches above its box (.braai canvas), so the post and the smoke aren't cut

/* Where a pixel of the canvas is in the picture */
const PLACE = `uniform float ext;uniform vec2 crop;vec2 place(vec2 u){return vec2((u.x-.5)*crop.x+.5,.5-(u.y*(1.+ext)-.5)*crop.y);}
`;
/* Step 1: the lit scene, linear, with how much of the pixel is scene in alpha */
const SCENE = `${PLACE}uniform vec4 lw;uniform vec3 grade;uniform float post,lod;uniform sampler2D pB,pF,pS,pK;
void main(){
  vec2 p=place(u);float keep=smoothstep(.0,.10,p.y);if(post>0.&&abs(p.x-.289)<.028)keep=max(keep,smoothstep(-.12,.08,p.y));
  float cov=smoothstep(.02,.97,textureLod(pK,p,lod).g)*keep;if(cov<.002){o=vec4(0.);return;}
  vec3 w=textureLod(pS,p,0.).rgb;float k=dot(vec4(w,max(0.,1.-w.r-w.g-w.b)),lw);
  vec3 c=(exp2(textureLod(pF,p,lod).rgb*8.1749)-1.)/24.*k+(exp2(textureLod(pB,p,lod).rgb*8.6475)-1.)*.013*grade;
  o=vec4(c*keep,cov);}`;
/* Step 2, every frame: the flames stand on two upright sheets (Z1, Z2) with their foot at FY; the pictures are on a log scale */
const LIVE = `uniform float t;${FLAME_LOOK}${PLACE}
uniform vec4 lw;uniform float pas,sw,flare,wind,foc;uniform vec2 piv;uniform vec4 box;uniform vec3 ro,fw,rt,up;
uniform sampler2D scene,pK,gB,gK;
const float Z1=0.,Z2=.16,FY=.60,SZ=.46;
vec3 flame(vec2 p,float x,float s,float h,float side,float a){vec2 q=vec2((p.x-x)*side,p.y)/s;if(abs(q.x)>.60||q.y<0.||q.y>2.)return vec3(0.);return burn(gas(q,h))*a;}
vec3 tone(vec3 x){x=(x*(2.51*x+.03))/(x*(2.43*x+.59)+.14);return pow(clamp(x,0.,1.),vec3(1./2.2));}
void main(){
  vec2 hp=place(u),cs=vec2((hp.x-.5)*pas,.5-hp.y);
  vec3 rd=normalize(fw*foc+rt*cs.x+up*cs.y);vec2 pa=(ro+rd*((Z1-ro.z)/rd.z)).xy-vec2(0.,FY);
  vec2 wob=vec2(0.);float hot=smoothstep(.95,.55,abs(pa.x))*smoothstep(.06,.3,pa.y)*(1.-smoothstep(.7,1.4,pa.y));
  if(hot>.02)wob=(vec2(ns(vec2(cs.x*44.,cs.y*26.-t*5.)),ns(vec2(cs.x*40.+9.,cs.y*26.-t*5.)))-.5)*.0030*hot;
  if(hp.y<.62){float leaf=textureLod(pK,hp,0.).b*smoothstep(.62,.10,hp.y);if(leaf>.004)wob.x-=leaf*(.0021*(sin(t*1.7+cs.x*19.+cs.y*8.)*.35+sin(t*2.9+cs.x*41.)*.22+(ns(vec2(cs.x*2.2-t*.55,t*.35))-.5)*1.1)+.0125*wind*(.8+.4*sin(t*3.1+cs.x*23.)));}
  vec4 S=textureLod(scene,u+wob*vec2(1./(pas*crop.x),-1./(crop.y*(1.+ext))),0.);vec3 col=S.rgb;float cov=S.a;
  if(abs(pa.x)<.95&&pa.y>-.02&&pa.y<.67+.30*flare){float K=textureLod(pK,hp+wob*vec2(1./pas,1.),0.).r;if(K<.99){
    vec2 pb=(ro+rd*((Z2-ro.z)/rd.z)).xy-vec2(0.,FY);float cut=smoothstep(.66+.30*flare,.42,pa.y)*(1.-K);
    col+=(flame(pa,-.50,SZ*.98,0.,1.,.80)+flame(pa,-.02,SZ*1.18,1.,1.,.85)+flame(pa,.49,SZ*1.04,0.,-1.,.80)+flame(pa,-.27,SZ*.66,1.,-1.,.50)+flame(pa,.24,SZ*.70,0.,1.,.50))*cut*.92+(flame(pb,-.36,SZ*.60,1.,1.,.55)+flame(pb,.12,SZ*.64,0.,-1.,.55))*cut*.8;}}
  float y=pa.y-.18,x=pa.x-wind*y*.45-y*.10;
  if(y>0.&&y<1.7&&abs(x)<.98+.24*y){
    vec2 sq=vec2(x*1.15,pa.y),w0=sq*1.7+vec2(0.,-t*.25),p1=sq*vec2(3.2,1.6)+2.4*vec2(.6*ns(w0)+.36*ns(w0*2.03+7.1),.6*ns(w0+vec2(5.2,.7))+.36*ns(w0*2.03+3.3))+vec2(0.,-t*.42);
    float d=smoothstep(.50,.98,fb(p1));
    if(d>.004){vec2 p2=p1+vec2(.32,.048);float d2=smoothstep(.45,.90,.57*ns(p2)+.38*ns(p2*2.03+7.1));float sa=d*exp(-pow(abs(x)/(.80+.2*y),4.))*smoothstep(0.,.35,y)*(1.-smoothstep(.75,1.7,y))*.55*(1.+.5*flare);
      col=mix(col,mix(vec3(.75,.28,.08)*(.5+.5*lw.z),vec3(.34,.235,.165)*clamp(.55+1.3*(d-d2),.15,1.4),smoothstep(0.,.32,y)),sa);cov+=sa*(1.-cov);}}
  vec2 r=vec2((hp.x-piv.x)*pas,hp.y-piv.y);float c=cos(sw),s=sin(sw);r=vec2(r.x*c+r.y*s,-r.x*s+r.y*c);vec2 gp=(vec2(r.x/pas,r.y)+piv-box.xy)/box.zw;
  if(gp.x>0.&&gp.x<1.&&gp.y>0.&&gp.y<1.){float a=textureLod(gK,gp,0.).r;if(a>.004){a=smoothstep(.02,.98,a);col=col*(1.-a)+(exp2(textureLod(gB,gp,0.).rgb*8.6475)-1.)*.013;cov+=a*(1.-cov);}}
  vec2 gd=(pa-vec2(wind*.06,.14))*vec2(.95,2.3);col+=vec3(.060,.0185,.0036)*exp(-dot(gd,gd)*1.9)*(.35+.65*lw.z)*S.a;
  cov=clamp(max(cov,min(1.,max(col.r,col.g)*.35)),0.,1.);if(cov<.003){o=vec4(0.);return;}
  col/=max(cov,.02);col=mix(col,col*col*(3.-2.*min(col,1.))*1.25,.28);
  col=tone(col)+(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/190.;
  o=vec4(clamp(col,0.,1.)*cov,cov);
}`;

function camera({ eye, target, zoom, w, h }: Shot) {
  const unit = (v: Vec3): Vec3 => { const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; };
  const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const fw = unit([target[0] - eye[0], target[1] - eye[1], target[2] - eye[2]]);
  const rt = unit([-fw[2], 0, fw[0]]);
  const up: Vec3 = [rt[1] * fw[2] - rt[2] * fw[1], rt[2] * fw[0] - rt[0] * fw[2], rt[0] * fw[1] - rt[1] * fw[0]];
  const to = (p: Vec3): Vec3 => { const d: Vec3 = [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]], z = dot(d, fw); return [0.5 + (zoom * dot(d, rt) * h) / (z * w), 0.5 - (zoom * dot(d, up)) / z, zoom / z]; };
  return { fw, rt, up, to };
}
type Pic = { tex: WebGLTexture; w: number };
function loadPicture(gl: WebGL2RenderingContext, src: string): Promise<Pic> {
  return new Promise((done, fail) => {
    const img = new Image();
    img.onerror = () => fail(new Error(`missing ${src}`));
    img.onload = async () => {
      await img.decode().catch(() => {});
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      done({ tex, w: img.naturalWidth });
    };
    img.src = src;
  });
}
type Kit = { gl: WebGL2RenderingContext; triangle: () => void; noise: WebGLTexture; flames: Flames; scene: Program; liveP: Program; embers: Embers; tex: WebGLTexture; frame: WebGLFramebuffer };

export function startBraai(root: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const still = reducedMotion();
  const phone = window.matchMedia("(max-width: 551px)"); // the same width as the still picture in Braai.tsx
  let kit: Kit | null = null, kitJob: Promise<Kit | null> | null = null, view: { shot: Shot; cam: ReturnType<typeof camera>; pics: Pic[] } | null = null;
  let live = false, loading: Shot | null = null, round = 0, w = 1, h = 1, quality = 1, t = 4, last = 0, raf = 0, seen = false, stopped = false, carry = 0, flare = 0, wind = 0, push = 0, lastX = -1, swing = 0.02, swingSpeed = 0;
  let slow = 0, half = false, odd = false, redraw = 0; // 30fps mode; time until the lit scene is drawn again
  const light = [1, 1, 1, 1];
  const off = () => { live = false; root.classList.remove("is-live"); };
  const shotFor = () => (phone.matches ? PHONE : WIDE);

  const makeKit = async (): Promise<Kit | null> => {
    const gl = createGL(canvas);
    if (!gl) return null;
    const triangle = createTriangle(gl), noise = createNoiseTexture(gl)!, embers = new Embers(gl, 140);
    const [flames, scene, liveP] = await Promise.all([createFlames(gl, triangle, noise), createProgramAsync(gl, SCENE), createProgramAsync(gl, LIVE)]);
    // let the fire catch before it is shown
    for (let i = 0; i < 60 && !stopped; i++) { t += 1 / 45; flames.step(1 / 45, t, 0, 0); if (i % 12 === 11) await new Promise((r) => setTimeout(r, 0)); }
    const tex = gl.createTexture()!, frame = gl.createFramebuffer()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    return { gl, triangle, noise, flames, scene, liveP, embers, tex, frame };
  };
  /** Gets everything ready for this screen shape (again after a rotation that needs the other picture) */
  const build = async () => {
    const shot = shotFor();
    if (loading === shot) return;
    loading = shot;
    const mine = ++round;
    off();
    try {
      const wanted = kit ?? (await (kitJob ??= makeKit()));
      if (stopped || mine !== round || !wanted) return;
      const pics = await Promise.all(NAMES.map((n) => loadPicture(wanted.gl, `/images/fire/${shot.name}-${n}.webp`)));
      if (stopped || mine !== round || wanted.gl.isContextLost()) return;
      view?.pics.forEach((p) => wanted.gl.deleteTexture(p.tex));
      kit = wanted;
      view = { shot, cam: camera(shot), pics };
      live = true;
      size();
      paint(0);
      root.classList.add("is-live");
      wake();
    } catch (e) { console.warn("The braai is off:", e); kitJob = null; off(); } finally { if (mine === round) loading = null; }
  };
  const size = () => {
    w = root.clientWidth || 1;
    h = root.clientHeight || 1;
    const scale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt((phone.matches ? 560000 : 780000) / (w * h * (1 + EXT)))) * quality;
    canvas.width = Math.max(2, Math.round(w * scale));
    canvas.height = Math.max(2, Math.round(h * (1 + EXT) * scale));
    if (kit) { const { gl } = kit; gl.bindTexture(gl.TEXTURE_2D, kit.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, canvas.width, canvas.height, 0, gl.RGBA, gl.HALF_FLOAT, null); gl.bindFramebuffer(gl.FRAMEBUFFER, kit.frame); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, kit.tex, 0); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    redraw = 0;
  };
  /** The part of the picture that shows (it covers the box, like object-fit: cover) */
  const crop = (s: Shot): [number, number] => { const b = w / h, p = s.w / s.h; return b > p ? [1, p / b] : [b / p, 1]; };
  const paint = (dt: number) => {
    if (!live || !kit || !view || kit.gl.isContextLost()) return;
    const { gl, scene, liveP, noise, flames, triangle, embers } = kit, { shot, cam, pics } = view, [cx, cy] = crop(shot), hook = cam.to(shot.hook);
    const use = (p: Program, tex: [string, WebGLTexture][]) => { gl.useProgram(p.program); tex.forEach(([n, x], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, x); gl.uniform1i(p.loc(n), i); }); gl.uniform1f(p.loc("ext"), EXT); gl.uniform2f(p.loc("crop"), cx, cy); const f = 1.6 * FIRE; gl.uniform4f(p.loc("lw"), light[0] * f, light[1] * f, light[2] * f, light[3] * f); };
    gl.viewport(0, 0, canvas.width, canvas.height);
    redraw -= dt;
    if (redraw <= 0) {
      redraw = 0.062;
      gl.bindFramebuffer(gl.FRAMEBUFFER, kit.frame);
      use(scene, [["pB", pics[0].tex], ["pF", pics[1].tex], ["pS", pics[2].tex], ["pK", pics[3].tex]]);
      gl.uniform3f(scene.loc("grade"), ...GRADE);
      gl.uniform1f(scene.loc("post"), shot.post);
      gl.uniform1f(scene.loc("lod"), Math.max(0, Math.log2((pics[0].w * cx) / canvas.width) - 0.35));
      triangle();
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    use(liveP, [["scene", kit.tex], ["pK", pics[3].tex], ["gB", pics[4].tex], ["gK", pics[5].tex], ["nz", noise], ["dye", flames.gas()]]);
    const at = liveP.loc;
    gl.uniform1f(at("t"), t); gl.uniform1f(at("pas"), shot.w / shot.h); gl.uniform1f(at("foc"), shot.zoom); gl.uniform1f(at("sw"), swing); gl.uniform1f(at("flare"), flare); gl.uniform1f(at("wind"), wind);
    gl.uniform2f(at("piv"), hook[0], hook[1]); gl.uniform4f(at("box"), ...shot.tongs); gl.uniform3f(at("ro"), ...shot.eye); gl.uniform3f(at("fw"), ...cam.fw); gl.uniform3f(at("rt"), ...cam.rt); gl.uniform3f(at("up"), ...cam.up);
    triangle();
    embers.draw(dt, t, w, h * (1 + EXT), wind);
  };
  /** A spark somewhere along the trough */
  const spark = (spread: number, rise: number) => {
    if (!kit || !view) return;
    const [cx, cy] = crop(view.shot), [x, y, metre] = view.cam.to([0, 0.7, 0]), span = (0.7 * metre * h) / cy;
    kit.embers.add(((x - 0.5) / cx + 0.5) * w + (Math.random() - 0.5) * span * 2, ((y - 0.5) / cy + 0.5 + EXT) * h - Math.random() * span * 0.25, (Math.random() - 0.5) * spread + wind * 60, -rise * Math.max(0.6, h / 700), 1 + Math.random() * 2.1, (0.6 + Math.random() * 0.7) * Math.max(0.8, h / 620));
  };
  // Moving across the fire makes a breeze: flames and leaves lean and the tongs swing
  const onMove = (e: PointerEvent) => { const x = (e.clientX - root.getBoundingClientRect().left) / w; if (lastX >= 0) { const d = Math.max(-0.08, Math.min(0.08, x - lastX)); push = Math.max(-1, Math.min(1, push + d * 3)); swingSpeed += d * 0.9; } lastX = x; };
  const onLeave = () => { lastX = -1; };
  // A click or tap blows on the fire
  const onClick = (e: MouseEvent) => { const side = (e.clientX - root.getBoundingClientRect().left) / w < 0.5 ? 1 : -1; flare = 1; swingSpeed += side * 0.22; push = side * 0.8; for (let i = 0; i < 60; i++) spark(320, 90 + Math.random() * 380); };
  const wave = (speed: number, shift: number) => Math.sin(t * speed + shift) * 0.5 + Math.sin(t * speed * 1.71 + shift * 2.3) * 0.3 + Math.sin(t * speed * 2.93 + shift * 0.7) * 0.2;
  const frame = (now: number) => {
    raf = 0;
    if (stopped || !seen || !live || !kit) return;
    raf = requestAnimationFrame(frame);
    odd = !odd;
    if (half && odd) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    t += dt;
    flare *= Math.exp(-dt * 1.5);
    push *= Math.exp(-dt * 1.3);
    wind += (push + Math.sin(t * 0.5) * 0.1 + Math.sin(t * 1.3) * 0.05 - wind) * Math.min(1, dt * 4);
    swingSpeed = (swingSpeed + (-swing * 24 + Math.sin(t * 0.9) * 0.25) * dt) * Math.exp(-dt * 0.55);
    swing = Math.max(-0.34, Math.min(0.34, swing + swingSpeed * dt));
    const glow = (1 + flare * 0.75) * (0.9 + 0.1 * wave(6.1, 0));
    light[0] = glow * (1 + 0.2 * wave(9, 1) - wind * 0.35);
    light[1] = glow * (1 + 0.2 * wave(10.3, 4) + wind * 0.35);
    light[2] = glow * (1 + 0.22 * wave(8.1, 2));
    light[3] = 1 + 0.06 * wave(2.2, 3) + flare * 0.7;
    for (let left = dt; left > 0.002; left -= 0.034) kit.flames.step(Math.min(left, 0.034), t, wind, flare);
    carry += dt * (w < 768 ? 4 : 7) * (1 + flare * 2);
    while (carry > 1) { carry--; spark(60, 50 + Math.random() * 170); }
    // can't hold 60: first a little less sharp, then an even 30 (smoother to look at than an uneven 45)
    slow = slow * 0.96 + (dt > (half ? 0.042 : 0.021) ? 0.04 : 0);
    if (slow > 0.34) { slow = 0; if (quality > 0.85) { quality -= 0.15; size(); } else if (!half) half = true; else if (quality > 0.55) { quality -= 0.15; size(); } }
    paint(dt);
  };
  const wake = () => { if (!live || stopped) return; if (still) paint(0); else if (seen && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const onLost = (e: Event) => { e.preventDefault(); round++; loading = null; kit = kitJob = view = null; off(); };
  const onRestored = () => void build();
  size();
  void build();
  const watcher = new IntersectionObserver((es) => { seen = es[es.length - 1].isIntersecting; wake(); });
  watcher.observe(canvas);
  const sizer = new ResizeObserver(() => { if ((view || loading) && (loading ?? view?.shot) !== shotFor()) { void build(); return; } size(); paint(0); });
  sizer.observe(root);
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  if (!still) { root.addEventListener("pointermove", onMove, { passive: true }); root.addEventListener("pointerleave", onLeave, { passive: true }); root.addEventListener("click", onClick); }
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    watcher.disconnect();
    sizer.disconnect();
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
    root.removeEventListener("pointermove", onMove); root.removeEventListener("pointerleave", onLeave); root.removeEventListener("click", onClick);
    root.classList.remove("is-live");
  };
}
