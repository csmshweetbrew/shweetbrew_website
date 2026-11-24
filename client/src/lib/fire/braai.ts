/*
 * THE BUSHVELD FIRE (bottom of the page)
 *
 * A live braai drawn by one shader: boerewors on a round grid that swings on chains under a tripod,
 * over a log fire in a ring of stones. Behind it a night sky, Table Mountain on the left and the hills
 * of Jerusalem on the right. Moving over it makes a breeze (flames lean, the grid swings); a click or
 * tap blows on the fire (a flare and sparks).
 *
 * The coal lumps are drawn once into a texture, the boerewors is real 3D (ray-marched), and it only
 * runs while it is on screen. If the device is slow it lowers its own resolution.
 * Reduced motion: one still picture.
 */

import { createGL, createNoiseTexture, createProgram, createProgramAsync, createTriangle, NOISE_TEX_GLSL, reducedMotion, Sparks, type Program } from "./gl";

/* Coal lumps that tile: r = height, g = id of the lump, b = grain, a = cracks */
const COALS = `
const float N=9.;
vec2 cell(vec2 n){n=mod(n,N);return vec2(h1(n+2.7),h1(n+31.7));}
float pn(vec2 p,float m){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(mod(i,m)),h1(mod(i+vec2(1,0),m)),f.x),mix(h1(mod(i+vec2(0,1),m)),h1(mod(i+vec2(1,1),m)),f.x),f.y);}
float pf(vec2 p,float m){return .5*pn(p,m)+.28*pn(p*2.,m*2.)+.15*pn(p*4.,m*4.)+.07*pn(p*8.,m*8.);}
void main(){
  vec2 k=u*N+.28*(vec2(pf(u*N*2.,N*2.),pf(u*N*2.+N,N*2.))-.5);
  vec2 n=floor(k),f=fract(k);float a=8.,b=8.,id=0.;vec2 to=vec2(0.);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(i,j);vec2 w=g+cell(n+g)-f;float d=length(w);if(d<a){b=a;a=d;id=h1(mod(n+g,N)+5.);to=w;}else if(d<b)b=d;}
  float gr=pf(u*N*5.,N*5.);
  float cr=pf(u*N*7.+floor(id*7.),N*7.);
  float edge=smoothstep(.0,.42,b-a+(gr-.5)*.16);
  float tilt=dot(to,vec2(cos(id*6.3),sin(id*6.3)))*.55;
  float ht=edge*clamp(.62+.30*id+tilt+(gr-.5)*.22-a*.22,0.,1.);
  o=vec4(ht,id,gr,cr);
}`;

/* Keep the first compile short on Windows drivers (an early version took 26 seconds): no texture() or
   fwidth() in here (derivatives force every branch and loop flat; pxl is the size of a pixel), loops start
   at ZERO so they aren't unrolled, and noise comes from a texture. Test it cold: drivers cache. */
const SCENE = `
uniform float t,as,cx,flare,foc,pxl,sw,wind;uniform sampler2D tx;
#define ZERO min(0,int(t))
/* Y0: the coals' own ground height. GY: the ground. SP, RR: spacing and thickness of the grid bars. R: the round grid. */
const float Y0=-.36,SP=.086,RR=.0165,GY=-1.12,R=.69;
/* ---- boerewors ---- */
float coil(vec3 p){p.xz-=vec2(0.,.62);p.y-=.088;float r=length(p.xz);float g=atan(p.z,p.x);if(g<0.)g+=6.28318;float b=.150,a=.055;float n=clamp(floor((r-a-b*g/6.28318)/b+.5),0.,2.);float d=abs(r-(a+b*(n+g/6.28318)));
 float R=.070+.011*(ns(p.xz*8.5)-.5)+.006*(ns(p.xz*24.)-.5);float e=length(vec2(d,p.y))-R;
 float s=length(vec3(p.x-(a+3.*b),p.y,p.z))-.066;vec3 q=vec3(p.x-a,p.y,p.z);return min(e,min(s,length(q)-.06));}
vec3 nrm(vec3 p){vec3 n=vec3(0.);for(int i=ZERO;i<4;i++){vec3 e=.5773*(2.*vec3(float(((i+3)>>1)&1),float((i>>1)&1),float(i&1))-1.);n+=e*coil(p+e*.0024);}return normalize(n);}
bool march(vec3 ro,vec3 rd,out float k){k=(.178-ro.y)/rd.y;float end=(.012-ro.y)/rd.y;for(int i=ZERO;i<34;i++){float d=coil(ro+rd*k);if(d<.002)return true;k+=min(d,.10)*.82;if(k>end)return false;}return false;}
vec3 wors(vec3 p,vec3 rd){vec3 n=nrm(p);float g1=fb(p.xz*vec2(34.,30.)),g2=fb(p.xz*11.+3.),g3=ns(p.xz*95.)*.6+ns(p.xz*190.)*.4;
 n=normalize(n+vec3(g1-.5+(g3-.5)*.5,0.,fb(p.zx*32.+9.)-.5+(ns(p.zx*120.)-.5)*.5)*.52);
 float bar=.5+.5*cos(p.x/SP*6.28318);vec3 a=mix(vec3(.17,.048,.016),vec3(.36,.125,.036),g2);a=mix(a,vec3(.46,.21,.07),smoothstep(.56,.74,g1)*.6);a*=.65+.7*g3;
 float ch=smoothstep(.52,.74,fb(p.xz*vec2(15.,8.)+1.7)*.80+bar*.30*smoothstep(-.1,.7,n.y));a=mix(a,vec3(.012,.009,.007),ch*.95);
 vec3 L=normalize(vec3(-.38,.86,.42)),V=-rd,H=normalize(L+V);float ao=clamp(coil(p+n*.045)/.045,.25,1.);
 vec3 c=a*(vec3(.18,.145,.13)*(.45+.55*n.y)+vec3(1.5,1.02,.70)*max(0.,dot(n,L)))*ao;
 c+=a*vec3(2.5,.70,.14)*pow(clamp(.62-n.y*.62,0.,1.),1.4)*1.15;
 c+=vec3(1.,.66,.38)*pow(max(0.,dot(n,H)),64.)*.95*(1.-.3*ch)*(.15+1.2*g1*g1)*ao;
 return c+vec3(1.,.30,.06)*pow(1.-max(0.,dot(n,V)),3.)*.20*(1.-max(0.,n.y)*.5);}
/* ---- fire ---- */
float glowAt(vec2 g){float P=smoothstep(.30,.66,fb(g*1.15+vec2(3.+t*.03,t*.045)));P=.18+.82*P;P*=.82+.18*ns(g*5.+t*1.3);return min(P+flare*.5,1.7);}
vec3 fireRamp(float e){return vec3(1.25,.20,.018)*e+vec3(.75,.48,.06)*e*e+vec3(.15,.22,.14)*e*e*e;}
vec3 coals(vec3 ro,vec3 rd,float tt){const float S=.46,A=.15;vec3 p=ro+rd*tt;vec3 st=rd*(A/max(.15,-rd.y))/12.;vec4 c=vec4(0.);float was=0.;
 for(int i=ZERO;i<12;i++){c=textureLod(tx,p.xz*S,0.);float gap=p.y-Y0-c.r*A;if(gap<0.){p-=st*(-gap/max(1e-4,was-gap));break;}was=gap;p+=st;}c=textureLod(tx,p.xz*S,0.);
 vec2 q=p.xz*S,e=vec2(.0065,0.);float hx=textureLod(tx,q+e.xy,0.).r-textureLod(tx,q-e.xy,0.).r,hz=textureLod(tx,q+e.yx,0.).r-textureLod(tx,q-e.yx,0.).r;vec3 n=normalize(vec3(-hx*1.5,1.,-hz*1.5));
 float P=glowAt(p.xz),low=1.-c.r;
 float ash=smoothstep(.36,.62,c.b+n.y*.12-.1)*smoothstep(.25,.6,c.r);
 vec3 base=mix(vec3(.016,.014,.013),vec3(.060,.052,.047),c.a);base=mix(base,vec3(.30,.275,.255),ash*.75);
 float li=.22+.78*max(0.,dot(n,normalize(vec3(-.35,.8,-.45))));
 vec3 r=base*li*(vec3(.55)+vec3(1.3,.42,.12)*P);
 float seam=smoothstep(.50,.95,low);
 float crack=smoothstep(.50,.72,c.a)*(1.-ash*.8)*smoothstep(.2,.85,c.g);
 float side=smoothstep(.55,.05,n.y)*.8+.2*low;
 float E=P*(seam*(.5+.6*c.b)+crack*.42+side*.28*smoothstep(.25,.8,c.g));
 return r+fireRamp(E)*1.25;}
/* a tall flame on an upright plane at depth z */
float tall(vec3 ro,vec3 rd,float z,float far,float sd,float wd){float k=(z-ro.z)/rd.z;if(k<0.||k>far)return 0.;vec3 p=ro+rd*k;float y=p.y-GY-.06;if(y<0.||y>1.6)return 0.;p.x-=wind*y*y*.55;
 float w=fb(vec2(p.x*2.4+sd,y*1.7-t*1.5)),f=fb(vec2(p.x*4.2+w*1.7+sd*3.,y*2.6-t*2.2));float x=p.x/(wd*(1.05-.45*y));float ht=(.72+.30*ns(vec2(t*1.3+sd,p.x*2.))+flare*.5)*exp(-x*x*1.5);return smoothstep(.36,.86,f+.48-y/max(.05,ht)*.62)*smoothstep(0.,.07,y)*exp(-x*x*.9);}
/* ---- metal and ground ---- */
float cap(vec3 ro,vec3 rd,vec3 a,vec3 b,float r){vec3 ba=b-a,oa=ro-a;float bb=dot(ba,ba),bd=dot(ba,rd),bo=dot(ba,oa),ra=dot(rd,oa),oo=dot(oa,oa);float A=bb-bd*bd,B=bb*ra-bo*bd,C=bb*oo-bo*bo-r*r*bb,h=B*B-A*C;if(h>=0.){float q=(-B-sqrt(h))/A,y=bo+q*bd;if(y>0.&&y<bb)return q;vec3 oc=y<=0.?oa:ro-b;B=dot(rd,oc);C=dot(oc,oc)-r*r;h=B*B-C;if(h>0.)return -B-sqrt(h);}return -1.;}
vec3 capN(vec3 p,vec3 a,vec3 b){vec3 ba=b-a;return normalize(p-a-ba*clamp(dot(p-a,ba)/dot(ba,ba),0.,1.));}
vec4 bars(vec3 p,float aw){float px=mod(p.x+SP*.5,SP)-SP*.5;float dz=min(abs(p.z-.36),abs(p.z-.94));float cm=1.-smoothstep(.022-aw,.022+aw,dz);float bm=1.-smoothstep(RR-aw,RR+aw,abs(px));float nx=clamp(px/RR,-1.,1.),ny=sqrt(max(0.,1.-nx*nx));float pit=fb(vec2(p.x*60.,p.z*22.));vec3 b=vec3(.040,.036,.034)*(.45+.75*ny)*(.6+.8*pit)+vec3(.30,.25,.21)*pow(max(0.,ny*.86-nx*.45),16.)*(.10+.35*pit*pit)+vec3(1.05,.22,.031)*pow(abs(nx),2.6)*.55;return vec4(mix(vec3(.032,.028,.027),b,bm)+vec3(.12,.028,.004),max(bm,cm));}
vec3 steel(vec3 p,vec3 n,vec3 rd){float br=fb(p.xy*vec2(9.,7.)+p.z*5.);vec3 c=vec3(.055,.050,.047)*(.35+.9*max(0.,n.y*.6+.4))*(.6+.7*br);c+=vec3(.7,.6,.5)*pow(max(0.,dot(reflect(rd,n),normalize(vec3(-.3,.85,.35)))),18.)*.12;return c+vec3(1.14,.26,.042)*pow(max(0.,.5-n.y*.5),2.)*.5;}
/* ---- night ---- */
vec3 sky(vec2 s,float hor){float y=s.y-hor;vec3 c=mix(vec3(.060,.040,.052),vec3(.016,.019,.042),smoothstep(0.,.5,y));c+=vec3(.22,.072,.030)*exp(-abs(y)*9.);
 vec2 g=s*46.;vec2 i=floor(g),f=fract(g)-.5;float r=h1(i+3.);float d=length(f-(vec2(h1(i+7.),h1(i+11.))-.5)*.7);c+=vec3(1.5,1.45,1.3)*(1.-smoothstep(0.,.15*r,d))*step(.84,r)*(.55+.45*sin(t*(1.+r*3.)+r*40.))*smoothstep(.02,.25,y);
 float mw=fb(s*vec2(2.2,3.4)+vec2(s.y*1.4,4.));return c+vec3(.12,.10,.13)*smoothstep(.48,.85,mw)*smoothstep(.05,.4,y);}
/* Table Mountain on the left, the hills and roofs of Jerusalem on the right, acacias in front */
vec3 land(vec3 col,float X,float y){
 float tm=.15*smoothstep(-1.12,-.98,X)*(1.-smoothstep(-.52,-.36,X))+.010*fb(vec2(X*22.,2.))+.05*smoothstep(-.42,-.30,X)*(1.-smoothstep(-.24,-.12,X))+.07*smoothstep(-1.36,-1.22,X)*(1.-smoothstep(-1.14,-1.02,X));
 float jh=.055*smoothstep(.1,.5,X)+.04*fb(vec2(X*2.6+9.,3.))*smoothstep(0.,.4,X);float town=smoothstep(.42,.50,X)*(1.-smoothstep(.98,1.06,X));
 float bl=town*(.010+.024*h1(vec2(floor(X*34.),5.)));float dq=(X-.72)/.026;float dome=.030*sqrt(max(0.,1.-dq*dq))+.018*step(abs(X-.72),.030);float tw=.052*step(abs(X-.90),.010)+.008*step(abs(X-.90),.014);float far=max(tm,jh+max(bl,max(dome,tw)));
 vec3 fc=mix(vec3(.034,.027,.038),vec3(.105,.048,.034),1.-smoothstep(0.,.16,y));
 float lit=step(.80,h1(floor(vec2(X,y)*vec2(150.,130.))))*town*step(y,jh+bl*.9)*step(jh,y);
 col=mix(col,fc+vec3(.33,.22,.085)*lit,1.-smoothstep(-.003,.003,y-far));
 for(int i=ZERO;i<2;i++){vec2 p=vec2(X-(i==0?-.84:1.13),y);float can=0.;for(int j=ZERO;j<4;j++){vec2 c=vec2(float(j)*.075-.11,.185+.018*sin(float(j)*2.4));vec2 e=(p-c)/vec2(.085,.021);can=max(can,1.-dot(e,e)+(.5*fb(p*42.)-.25)*1.6);}
  float tk=step(abs(p.x-.01),.0065)*step(p.y,.18)+step(abs(abs(p.x-.01)-.55*(p.y-.085)),.004)*step(.085,p.y)*step(p.y,.18);col=mix(col,vec3(.006,.005,.006),clamp(step(.001,can)+tk,0.,1.)*step(0.,y));}
 float near=.020+.030*fb(vec2(X*3.1,8.))+.006*fb(vec2(X*40.,1.));return mix(col,vec3(.016,.012,.013),1.-smoothstep(-.003,.003,y-near));}
vec3 plume(vec2 s,vec3 col){float y=s.y-.02;if(y<0.)return col;vec2 q=vec2(s.x*1.5-wind*y,s.y*1.2);vec2 w=vec2(fb(q*2.+vec2(0.,-t*.24)),fb(q*2.+vec2(5.2,-t*.2)));float m=smoothstep(.38,.9,fb(q*vec2(2.8,1.5)+w*2.2+vec2(0.,-t*.45)));float x=(s.x-.02-wind*y*.7)/(.16+y*.5);m*=exp(-x*x*1.6)*smoothstep(0.,.12,y)*.55;return mix(col,mix(vec3(.52,.21,.08),vec3(.26,.24,.235),smoothstep(0.,.35,y)),m);}
void main(){
 vec2 s=vec2((u.x-.5)*as,u.y-.5);
 vec3 ro=vec3(cx*2.2,.86,-4.5),ta=vec3(cx*.3,.17,.62);vec3 fw=normalize(ta-ro),rt=normalize(cross(vec3(0,1,0),fw));vec3 rd=normalize(fw*foc+rt*s.x+cross(fw,rt)*s.y);
 float hor=foc*.69/5.12;vec3 col=sky(s,hor);
 /* narrow screens squeeze the skyline so both ends stay in view */
 float q=max(1.,2.3/as);col=land(col,s.x*q+cx*.25,(s.y-hor)*pow(q,.55));
 float hit=1e3,br=.86+.14*ns(vec2(t*3.6,1.))+flare*.3;vec3 fp=vec3(0.,GY+.25,.62);
 /* ground: moonlight, and firelight near the fire */
 if(rd.y<0.){float k=(GY-ro.y)/rd.y;vec3 p=ro+rd*k;if(k<40.){float r=length(p.xz-fp.xz);float a=fb(p.xz*2.3),b=fb(p.xz*11.),nb=fb(p.xz*7.);vec3 g=mix(vec3(.045,.027,.018),vec3(.115,.070,.044),a*.6+b*.5)*(vec3(.17,.155,.20)+vec3(3.2,.98,.23)*br*1.5/(1.+r*r*1.5))*(.8+.4*nb);col=mix(g,col,smoothstep(8.,20.,k));hit=k;
  if(r<.72){vec3 c=coals(ro+vec3(0.,Y0-GY,0.),rd,(GY+.15-ro.y)/rd.y);col=mix(col,c*1.3+fireRamp(.35*(1.-smoothstep(.30,.72,r))),1.-smoothstep(.58,.72,r+.1*(nb-.5)));}}}
 /* ring of stones */
 for(int i=ZERO;i<13;i++){float a=float(i)/13.*6.28318+.2,r=.14+.035*h1(vec2(float(i),2.));vec3 c=vec3(cos(a)*.90,GY+r*.45,.62+sin(a)*.80);vec3 oc=(ro-c)*vec3(1.,1.35,1.),d=rd*vec3(1.,1.35,1.);float A=dot(d,d),B=dot(oc,d),C=dot(oc,oc)-r*r,h=B*B-A*C;if(h>0.){float k=(-B-sqrt(h))/A;if(k>0.&&k<hit){vec3 p=ro+rd*k;vec3 n=normalize((p-c)*vec3(1.,1.8,1.));float g=fb(p.xy*13.+float(i)*3.+p.z*9.);n=normalize(n+(vec3(g,fb(p.zy*9.+float(i)),fb(p.xz*8.+float(i)))-.5)*1.5);col=mix(vec3(.07,.060,.054),vec3(.17,.150,.132),g)*(vec3(.16,.155,.20)*(.4+.6*n.y)+vec3(3.4,1.05,.25)*max(0.,dot(n,normalize(fp-p))+.12)*br*.9);hit=k;}}}
 /* logs */
 for(int i=ZERO;i<5;i++){float I=float(i),a=I*.74+.25+.35*h1(vec2(I,9.));vec3 v=vec3(cos(a),0.,sin(a));float ll=.40+.22*h1(vec2(I,4.));vec3 A=vec3(.06*sin(I*3.),GY+.08,.62)-v*ll,B=vec3(0.,GY+.15+.075*I,.62)+v*(ll-.06);float k=cap(ro,rd,A,B,.060+.026*h1(vec2(I,6.)));if(k>0.&&k<hit){vec3 p=ro+rd*k,n=capN(p,A,B),ba=normalize(B-A);float al=dot(p-A,ba);float bk=fb(vec2(al*7.,atan(n.y,dot(n,cross(ba,vec3(0,1,0))))*3.+I));float cen=1.-smoothstep(.12,.50,length(p.xz-fp.xz));float ck=(1.-smoothstep(.36,.50,abs(bk-.5)*3.))*cen;col=mix(vec3(.018,.013,.011),vec3(.075,.048,.034),bk)*(.5+.7*max(0.,n.y))+fireRamp(ck*(.55+.5*ns(vec2(al*9.,t*1.4))))*.9+vec3(.9,.2,.03)*cen*max(0.,-n.y+.3)*.6;hit=k;}}
 col+=fireRamp(clamp(tall(ro,rd,.86,hit,3.1,.50)+.8*tall(ro,rd,.70,hit,8.4,.42),0.,1.5)*.95);
 /* tripod */
 vec3 apex=vec3(0.,1.62,.62);
 for(int i=ZERO;i<3;i++){float a=i==0?-.42:i==1?3.56:1.95;vec3 b=vec3(cos(a)*1.28,GY,.62+sin(a)*.95),top=apex+(apex-b)*.07;float k=cap(ro,rd,top,b,.028);if(k>0.&&k<hit){vec3 p=ro+rd*k,n=capN(p,top,b);float g=fb(p.xy*vec2(20.,6.));col=mix(vec3(.05,.045,.042),vec3(.10,.055,.035),g)*(vec3(.3,.3,.36)*(.4+.6*max(0.,n.y-n.x))+vec3(3.,.9,.2)*max(0.,dot(n,normalize(fp-p)))*br);hit=k;}}
 /* the grid swings on its chains */
 vec3 rs=ro-vec3(sw,0.,0.);
 for(int i=ZERO;i<3;i++){float a=float(i)*2.0944+.5236;vec3 b=vec3(cos(a)*R,0.,.62+sin(a)*R),tp=apex-vec3(sw,.06,0.);float k=cap(rs,rd,tp,b,.014);if(k>0.&&k<hit){vec3 p=rs+rd*k;float lk=.5+.5*cos(length(p-tp)*95.);col=mix(vec3(.02),vec3(.17,.15,.14),lk)+vec3(.28,.077,.014)*lk*(1.-smoothstep(-.1,.9,p.y));hit=k;}}
 if(rd.y<0.){float t0=-rs.y/rd.y;vec3 p0=rs+rd*t0;if(length(p0.xz-vec2(0.,.62))<R&&t0<hit){vec4 b=bars(p0,t0*pxl*1.1);col=mix(col,b.rgb,b.a);}
  float k;if(march(rs,rd,k)&&k<hit){col=wors(rs+rd*k,rd);hit=k;}
  /* ring of the grid */
  k=(.06-rs.y)/rd.y;for(int i=ZERO;i<20;i++){vec3 p=rs+rd*k;vec2 e=p.xz-vec2(0.,.62);float l=max(1e-3,length(e)),d=length(vec2(l-R,p.y))-.024;if(d<.0015){if(k<hit+.05){vec2 o2=e/l*(l-R);vec3 n=normalize(vec3(o2.x,p.y,o2.y));col=steel(p,n,rd)*1.4+vec3(.9,.22,.03)*max(0.,-n.y)*.5;}break;}k+=max(d,.002);if(p.y<-.06)break;}}
 float front=.75*tall(ro,rd,.36,hit,5.7,.34)*(1.-smoothstep(-.35,.15,(ro+rd*((.36-ro.z)/rd.z)).y));col+=fireRamp(clamp(front,0.,1.3)*.7);
 vec2 gq=(s-vec2(0.,-.22))*vec2(1.,1.25);col+=vec3(.15,.0345,.0054)*exp(-dot(gq,gq)*6.)*br;
 col=plume(s,col);
 col=1.-exp(-col*1.5);
 /* melts into the page above and ends in the footer's colour below */
 float top=1.-smoothstep(.86,1.,u.y);o=vec4(mix(vec3(.0157,.0118,.0078),col,smoothstep(0.,.12,u.y))*top,top);
}`;

export function startBraai(root: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const still = reducedMotion();
  let gl = createGL(canvas);
  let scene: Program | null = null;
  let triangle = () => {};
  let w = 1, h = 1, quality = 1, slow = 0, t = 4, last = 0, raf = 0, seen = false, stopped = false, carry = 0;
  let camX = 0, camGoal = 0, flare = 0, wind = 0, push = 0, lastX = -1;
  let swing = 0.03, swingSpeed = 0; // the grid on its chains
  const sparks = new Sparks(160);

  const build = async () => {
    if (!gl) return;
    try {
      // The coal lumps, drawn once
      const bake = createProgram(gl, COALS);
      triangle = createTriangle(gl);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, 512, 512);
      gl.useProgram(bake.program);
      triangle();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteFramebuffer(fbo);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const noise = createNoiseTexture(gl);
      const ready = await createProgramAsync(gl, SCENE, NOISE_TEX_GLSL);
      if (stopped) return;
      sparks.build(gl);
      gl.useProgram(ready.program);
      gl.uniform1i(ready.loc("tx"), 0);
      gl.uniform1i(ready.loc("nz"), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, noise);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      scene = ready;
      root.classList.add("is-live");
      wake();
    } catch (e) {
      console.warn("The braai is off:", e);
      scene = null;
      root.classList.remove("is-live");
    }
  };

  const size = () => {
    w = root.clientWidth || 1;
    h = root.clientHeight || 1;
    const cap = 1.5;
    const scale = Math.min(window.devicePixelRatio || 1, cap, Math.sqrt(760000 / (w * h))) * quality;
    canvas.width = Math.max(2, Math.round(w * scale));
    canvas.height = Math.max(2, Math.round(h * scale));
  };

  const paint = () => {
    if (!gl || !scene || gl.isContextLost()) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(scene.program);
    gl.uniform1f(scene.loc("t"), t);
    gl.uniform1f(scene.loc("as"), w / h);
    gl.uniform1f(scene.loc("cx"), camX);
    gl.uniform1f(scene.loc("flare"), flare);
    gl.uniform1f(scene.loc("foc"), focus());
    gl.uniform1f(scene.loc("pxl"), 1 / (focus() * canvas.height));
    gl.uniform1f(scene.loc("sw"), swing);
    gl.uniform1f(scene.loc("wind"), wind);
    triangle();
    sparks.draw(w, h, canvas.width / w);
  };

  /** Zoom: narrow screens step back so the whole fire fits */
  const focus = () => Math.min(1.5, (w / h) * 1.72);

  // Moving across the fire makes a breeze: flames lean and the grid swings
  const onMove = (e: PointerEvent) => {
    const x = (e.clientX - root.getBoundingClientRect().left) / w;
    if (lastX >= 0) {
      const d = Math.max(-0.08, Math.min(0.08, x - lastX));
      push = Math.max(-1, Math.min(1, push + d * 3));
      swingSpeed += d * 1.6;
    }
    lastX = x;
    if (e.pointerType === "mouse") camGoal = (x - 0.5) * 0.34;
  };
  const onLeave = () => { camGoal = 0; lastX = -1; };
  // A click or tap blows on the fire
  const onClick = (e: MouseEvent) => {
    const x = (e.clientX - root.getBoundingClientRect().left) / w;
    flare = 1;
    swingSpeed += x < 0.5 ? 0.35 : -0.35;
    push = x < 0.5 ? 0.8 : -0.8;
    for (let i = 0; i < 60; i++) sparks.add(w / 2 + (Math.random() - 0.5) * h * 0.2, h * (0.66 + Math.random() * 0.14), (Math.random() - 0.5) * 300 + push * 90, -(90 + Math.random() * 380), 0.8 + Math.random() * 1.8, 0.8 + Math.random() * 0.8);
  };

  const frame = (now: number) => {
    raf = 0;
    if (stopped || !seen) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    t += dt;
    flare *= Math.exp(-dt * 1.7);
    push *= Math.exp(-dt * 1.4);
    wind += (push + Math.sin(t * 0.5) * 0.12 - wind) * Math.min(1, dt * 4);
    swingSpeed += (-swing * 7 + Math.sin(t * 0.9) * 0.12) * dt;
    swingSpeed *= Math.exp(-dt * 0.55);
    swing = Math.max(-0.28, Math.min(0.28, swing + swingSpeed * dt));
    camX += (camGoal - camX) * Math.min(1, dt * 3);
    carry += dt * (w < 768 ? 6 : 9);
    while (carry > 1) {
      carry--;
      sparks.add(w / 2 + (Math.random() - 0.5) * h * 0.22, h * (0.6 + Math.random() * 0.18), (Math.random() - 0.5) * 60 + wind * 60, -(50 + Math.random() * 170), 1 + Math.random() * 2.2, 0.6 + Math.random() * 0.6);
    }
    sparks.move(dt);
    paint();
    // Slow device: draw fewer pixels rather than dropping frames
    slow = slow * 0.94 + (dt > 0.023 ? 0.06 : 0);
    if (slow > 0.7 && quality > 0.75) {
      quality -= 0.13;
      slow = 0;
      size();
    }
    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (!seen || stopped) return;
    if (still) paint();
    else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  };

  const onLost = (e: Event) => { e.preventDefault(); scene = null; root.classList.remove("is-live"); };
  const onRestored = () => { gl = createGL(canvas); void build(); };

  size();
  void build();
  const watcher = new IntersectionObserver(([entry]) => { seen = entry.isIntersecting; wake(); }, { rootMargin: "80px" });
  watcher.observe(root);
  const sizer = new ResizeObserver(() => { size(); paint(); });
  sizer.observe(root);
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  if (!still) {
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave, { passive: true });
    root.addEventListener("click", onClick);
  }

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    watcher.disconnect();
    sizer.disconnect();
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", onLeave);
    root.removeEventListener("click", onClick);
  };
}
