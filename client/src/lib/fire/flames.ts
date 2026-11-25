/*
 * Live flames: a small fluid simulation (moving air that carries burning gas).
 * Two separate fires sit side by side in one texture; the braai draws several copies of them.
 */

import { createProgramAsync, type Program } from "./gl";

// Size of the air grid and of the burning gas, and how many metres one fire's half covers
const AIR_W = 160, AIR_H = 112, GAS_W = 416, GAS_H = 296;
const HALF = "vec2(1.5,2.125)";

const HOLD = `const vec2 WS=${HALF};
vec2 hold(vec2 a,float h,float e){a.x=clamp(a.x,h*.5+e,h*.5+.5-e);a.y=clamp(a.y,e,1.-e);return a;}
`;

/* The air moves itself along, rises over the fire, curls, and is pushed by the breeze */
const ADVECT = `${HOLD}uniform sampler2D v,d;uniform float dt,t,wind;
void main(){
  float h=step(.5,u.x);vec2 a=textureLod(v,hold(u-dt*textureLod(v,u,0.).xy/(WS*vec2(2.,1.)),h,.004),0.).xy;
  vec4 c=textureLod(d,u,0.);float T=c.r;vec2 w=vec2(u.x*2.-h,u.y)*WS;
  float xc=w.x-.75,xw=xc/(h<.5?.40:.33);
  vec2 up=vec2(-xc*1.1*smoothstep(.05,.4,w.y)*smoothstep(1.2,.5,w.y),mix(1.15,3.1,smoothstep(0.,.8,w.y))*(.30+.70*exp(-xw*xw)));
  a+=dt*11.*exp(-xw*xw*.8)*smoothstep(1.9,1.2,w.y)*(up-a);
  a.y+=dt*(5.*T+2.*c.g);
  vec2 n=vec2(fb(w*vec2(4.6,3.2)+vec2(h*31.,-t*6.4)),fb(w*vec2(4.6,3.2)+vec2(h*17.+9.,-t*6.4+5.)))-.5;
  vec2 n2=vec2(fb(w*11.+vec2(h*3.,-t*17.)),fb(w*11.+vec2(7.+h,-t*17.+3.)))-.5;
  a+=dt*(n*vec2(62.,26.)+n2*vec2(80.,34.))*(T+.10);
  a.x+=dt*wind*(1.1+3.*w.y)*(.35+T);
  a*=1.-dt*.55;a.y*=smoothstep(0.,.02,u.y)*.8+.2;
  float ex=abs(u.x*2.-h-.5)*2.;a*=1.-dt*3.*smoothstep(.72,1.,ex);a*=1.-dt*4.*smoothstep(.85,1.,u.y);
  o=vec4(a,0.,1.);}`;

/* Keeps small swirls alive */
const SWIRL = `uniform sampler2D v;uniform vec2 px;uniform float dt;
float c(vec2 p){return textureLod(v,p+vec2(px.x,0.),0.).y-textureLod(v,p-vec2(px.x,0.),0.).y-textureLod(v,p+vec2(0.,px.y),0.).x+textureLod(v,p-vec2(0.,px.y),0.).x;}
void main(){float l=abs(c(u-vec2(px.x,0.))),r=abs(c(u+vec2(px.x,0.))),b=abs(c(u-vec2(0.,px.y))),a=abs(c(u+vec2(0.,px.y))),m=c(u);
  vec2 n=vec2(r-l,a-b);n/=length(n)+.02;o=vec4(textureLod(v,u,0.).xy+dt*3.*m*vec2(n.y,-n.x),0.,1.);}`;

/* The next three keep the air from piling up: measure it, spread the pressure, push back */
const DIVERGE = `uniform sampler2D v,d;uniform vec2 px;
void main(){float x=textureLod(v,u+vec2(px.x,0.),0.).x-textureLod(v,u-vec2(px.x,0.),0.).x,y=textureLod(v,u+vec2(0.,px.y),0.).y-textureLod(v,u-vec2(0.,px.y),0.).y;
  o=vec4(.5*(x+y)-.016*textureLod(d,u,0.).g,0.,0.,1.);}`;
const PRESSURE = `uniform sampler2D q,b;uniform vec2 px;
void main(){float s=textureLod(q,u+vec2(px.x,0.),0.).x+textureLod(q,u-vec2(px.x,0.),0.).x+textureLod(q,u+vec2(0.,px.y),0.).x+textureLod(q,u-vec2(0.,px.y),0.).x;
  o=vec4((s-textureLod(b,u,0.).x)*.25,0.,0.,1.);}`;
const PUSH = `uniform sampler2D v,q;uniform vec2 px;
void main(){vec2 g=vec2(textureLod(q,u+vec2(px.x,0.),0.).x-textureLod(q,u-vec2(px.x,0.),0.).x,textureLod(q,u+vec2(0.,px.y),0.).x-textureLod(q,u-vec2(0.,px.y),0.).x);
  o=vec4(textureLod(v,u,0.).xy-.5*g,0.,1.);}`;

/* r = heat (lifts the air), g = burning gas (what you see). New gas comes in along the foot of the fire. */
const GAS = `${HOLD}uniform sampler2D v,d;uniform float dt,t,flare;
void main(){
  float h=step(.5,u.x);vec4 c=textureLod(d,hold(u-dt*textureLod(v,u,0.).xy/(WS*vec2(2.,1.)),h,.0015),0.);
  vec2 w=vec2(u.x*2.-h-.5,u.y)*WS;float wc=h<.5?.38:.30;
  float cool=(.62+.85*ns(w*vec2(9.,5.)+vec2(h*5.,-t*5.)))*(1.+1.5*min(2.,(w.x*w.x)/(wc*wc)));
  c.r=max(0.,c.r-dt*(1.1*c.r+.16));c.g=max(0.,c.g-dt*(1.36-.48*flare)*cool);
  float x=w.x/(h<.5?.34:.28);
  float s2=smoothstep(.30,.72,ns(vec2(w.x*13.+h*9.,t*2.4))),pu=.72+.28*ns(vec2(t*2.1,h*4.+.5)),nn=fb(vec2(w.x*9.+h*23.,t*2.6+h*7.));
  float s=exp(-x*x*1.1)*(.08+1.12*smoothstep(.36,.66,nn))*(.55+.45*s2)*(.85+.15*pu);
  s=smoothstep(.10,.60,s);s=s*(1.+.5*flare)+flare*.35*exp(-x*x);
  float base=.02+.11*exp(-x*x*1.9)+.06*ns(vec2(w.x*11.,h*3.+t*.7)),m=smoothstep(base+.05,base-.02,w.y)*smoothstep(0.,.02,w.y);
  float fine=ns(vec2(w.x*30.+h*5.,t*11.))*.6+.4*ns(vec2(w.x*58.,t*17.));
  c.g=max(c.g,s*m*(.42+.80*fine));c.r=max(c.r,s*m);
  float ex=abs(u.x*2.-h-.5)*2.;c*=1.-smoothstep(.9,1.,ex);c*=1.-smoothstep(.9,1.,u.y);o=c;}`;

/** GLSL: gas() reads a fire at p (metres from the middle of its foot, h = which of the two), burn() colours it. Needs uniform t. */
export const FLAME_LOOK = `uniform sampler2D dye;
float gas(vec2 p,float h){
  vec2 a=p/${HALF}+vec2(.5,0.);if(a.x<0.||a.x>1.||a.y<0.||a.y>1.)return 0.;
  vec2 w=vec2(ns(p*21.+vec2(h*9.,-t*5.)),ns(p*21.+vec2(4.,-t*5.+h*3.)))-.5;a+=w*.010*min(1.,a.y*4.);
  a.x=(clamp(a.x,.004,.996)+h)*.5;float g=textureLod(dye,a,0.).g;
  g*=smoothstep(.0,.15,p.y+.05*(ns(vec2(p.x*16.,t*1.7+h*5.))-.6)+.16*p.x*p.x);
  vec2 s=p+w*.05;return g*(.70+.62*(.55*ns(s*vec2(26.,8.)+vec2(h*7.,-t*13.))+.45*ns(s*vec2(52.,17.)+vec2(h*3.,-t*21.))));}
vec3 burn(float g){g=clamp(g,0.,1.2);float e=smoothstep(.0,.30,g);return vec3(1.85,.40,.036)*e*(.16+g)+vec3(2.3,1.15,.28)*g*g*g*g;}
`;

type Target = { tex: WebGLTexture; frame: WebGLFramebuffer; w: number; h: number };
type Uniforms = Record<string, number | [number, number]>;

export type Flames = { gas: () => WebGLTexture; step: (dt: number, t: number, wind: number, flare: number) => void };

export async function createFlames(gl: WebGL2RenderingContext, triangle: () => void, noise: WebGLTexture): Promise<Flames> {
  if (!gl.getExtension("EXT_color_buffer_float") && !gl.getExtension("EXT_color_buffer_half_float")) throw new Error("no float targets");
  const [advect, swirl, diverge, pressure, push, gas] = await Promise.all([ADVECT, SWIRL, DIVERGE, PRESSURE, PUSH, GAS].map((s) => createProgramAsync(gl, s)));

  const target = (w: number, h: number, format: number): Target => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, format, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const frame = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("float targets");
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, frame, w, h };
  };
  const air = [target(AIR_W, AIR_H, gl.RG16F), target(AIR_W, AIR_H, gl.RG16F)];
  const press = [target(AIR_W, AIR_H, gl.R16F), target(AIR_W, AIR_H, gl.R16F)];
  const div = target(AIR_W, AIR_H, gl.R16F);
  const dye = [target(GAS_W, GAS_H, gl.RGBA16F), target(GAS_W, GAS_H, gl.RGBA16F)];
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const run = (p: Program, to: Target, textures: Record<string, WebGLTexture>, uniforms: Uniforms) => {
    gl.useProgram(p.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, to.frame);
    gl.viewport(0, 0, to.w, to.h);
    Object.entries(textures).forEach(([name, tex], i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(p.loc(name), i);
    });
    for (const [name, value] of Object.entries(uniforms)) {
      if (typeof value === "number") gl.uniform1f(p.loc(name), value);
      else gl.uniform2f(p.loc(name), value[0], value[1]);
    }
    triangle();
  };
  const px: [number, number] = [1 / AIR_W, 1 / AIR_H];

  return {
    gas: () => dye[0].tex,
    step(dt, t, wind, flare) {
      run(advect, air[1], { v: air[0].tex, d: dye[0].tex, nz: noise }, { dt, t, wind });
      air.reverse();
      run(swirl, air[1], { v: air[0].tex }, { px, dt });
      air.reverse();
      run(diverge, div, { v: air[0].tex, d: dye[0].tex }, { px });
      for (let i = 0; i < 6; i++) {
        run(pressure, press[1], { q: press[0].tex, b: div.tex }, { px });
        press.reverse();
      }
      run(push, air[1], { v: air[0].tex, q: press[0].tex }, { px });
      air.reverse();
      run(gas, dye[1], { v: air[0].tex, d: dye[0].tex, nz: noise }, { dt, t, flare });
      dye.reverse();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
  };
}
