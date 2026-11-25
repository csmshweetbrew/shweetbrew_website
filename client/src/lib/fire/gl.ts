/*
 * Small WebGL2 + spark helpers shared by the fire background and the braai.
 * No 3D library: each effect is one full-screen triangle and one fragment shader.
 */

/* Smooth noise, read from a small texture (uniform nz): quicker to draw and to compile than computing it.
   Keep the weights: the flames are tuned to them. */
export const NOISE_GLSL = `
uniform sampler2D nz;
float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return textureLod(nz,(i+f+.5)/256.,0.).r;}
float fb(vec2 p){return .5*ns(p)+.27*ns(p*2.03+7.1)+.15*ns(p*4.1+3.3)+.08*ns(p*8.3+1.7);}
`;

/** The texture NOISE_GLSL reads */
export function createNoiseTexture(gl: WebGL2RenderingContext) {
  const bytes = new Uint8Array(256 * 256);
  let seed = 7;
  const next = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 24;
  // every fourth number: the flames are tuned to exactly this noise
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = next();
    next(); next(); next();
  }
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 256, 256, 0, gl.RED, gl.UNSIGNED_BYTE, bytes);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

const VERTEX = `#version 300 es
in vec2 p;out vec2 u;void main(){u=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const HEAD = `#version 300 es
precision highp float;precision highp sampler2D;in vec2 u;out vec4 o;`;

export type Program = { program: WebGLProgram; loc: (name: string) => WebGLUniformLocation | null };

export function createGL(canvas: HTMLCanvasElement, alpha = true): WebGL2RenderingContext | null {
  return canvas.getContext("webgl2", { alpha, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
}

function startProgram(gl: WebGL2RenderingContext, fragment: string) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  const shader = compile(gl.FRAGMENT_SHADER, HEAD + NOISE_GLSL + fragment);
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, shader);
  gl.bindAttribLocation(program, 0, "p");
  gl.linkProgram(program);
  return { program, shader };
}

function finishProgram(gl: WebGL2RenderingContext, { program, shader }: ReturnType<typeof startProgram>): Program {
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || gl.getProgramInfoLog(program) || "shader failed");
  const cache = new Map<string, WebGLUniformLocation | null>();
  return {
    program,
    loc: (name) => {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
      return cache.get(name)!;
    },
  };
}

/** Compiles in the background (where the browser can), so scrolling doesn't hitch. NOISE_GLSL comes with it. */
export async function createProgramAsync(gl: WebGL2RenderingContext, fragment: string): Promise<Program> {
  const ext = gl.getExtension("KHR_parallel_shader_compile");
  const job = startProgram(gl, fragment);
  if (ext) while (!gl.isContextLost() && !gl.getProgramParameter(job.program, ext.COMPLETION_STATUS_KHR)) await new Promise((r) => setTimeout(r, 30));
  return finishProgram(gl, job);
}

/** One triangle that covers the whole canvas; call the result to draw it */
export function createTriangle(gl: WebGL2RenderingContext): () => void {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  return () => {
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
}

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- sparks: glowing points added on top of the same canvas ---------- */

const SPARK_VERTEX = `#version 300 es
in vec4 p;uniform vec2 box;uniform float k;out float u;
void main(){u=p.z;gl_Position=vec4(p.x/box.x*2.-1.,1.-p.y/box.y*2.,0.,1.);gl_PointSize=p.w*k;}`;
const SPARK_FRAGMENT = `#version 300 es
precision mediump float;in float u;out vec4 o;
void main(){float d=length(gl_PointCoord-.5)*2.;float a=max(0.,1.-d);o=vec4((vec3(.92,.22,.04)*a*a*.6+vec3(1.,.72,.36)*pow(a,5.)*1.3)*min(1.,u*1.7),0.);}`;

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number };

export class Sparks {
  private list: Spark[] = [];
  private gl: WebGL2RenderingContext | null = null;
  private prog: Program | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private buffer: WebGLBuffer | null = null;
  private data: Float32Array;

  constructor(private limit: number) {
    this.data = new Float32Array(limit * 4);
  }

  build(gl: WebGL2RenderingContext) {
    this.gl = gl;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, SPARK_VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, SPARK_FRAGMENT));
    gl.bindAttribLocation(program, 0, "p");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("sparks failed");
    const at = { box: gl.getUniformLocation(program, "box"), k: gl.getUniformLocation(program, "k") } as Record<string, WebGLUniformLocation | null>;
    this.prog = { program, loc: (name) => at[name] };
    this.vao = gl.createVertexArray();
    this.buffer = gl.createBuffer();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  /** Position in CSS pixels, speed in pixels per second */
  add(x: number, y: number, vx: number, vy: number, life: number, size = 1) {
    if (this.list.length < this.limit) this.list.push({ x, y, vx, vy, life, max: life, size });
  }

  move(dt: number, shiftY = 0) {
    for (const s of this.list) {
      s.life -= dt;
      s.vx += (Math.random() - 0.5) * 260 * dt;
      s.vx *= 1 - dt * 0.8;
      s.x += s.vx * dt;
      s.y += s.vy * dt + shiftY;
    }
    this.list = this.list.filter((s) => s.life > 0 && s.y > -20);
  }

  /** w and h are the canvas size in CSS pixels, scale is canvas pixels per CSS pixel */
  draw(w: number, h: number, scale: number) {
    const { gl, prog } = this;
    if (!gl || !prog || !this.list.length) return;
    this.list.forEach((s, i) => {
      const k = s.life / s.max;
      this.data.set([s.x, s.y, k, (7 + 8 * k) * s.size], i * 4);
    });
    gl.useProgram(prog.program);
    gl.uniform2f(prog.loc("box"), w, h);
    gl.uniform1f(prog.loc("k"), scale);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data, 0, this.list.length * 4);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.drawArrays(gl.POINTS, 0, this.list.length);
    gl.disable(gl.BLEND);
  }
}
