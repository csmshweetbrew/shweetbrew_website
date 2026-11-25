/* Sparks off the log fire: little streaks that follow their own path, added on top of the same canvas. */

const VERTEX = `#version 300 es
precision highp float;in vec2 q;in vec4 a;in vec3 b;uniform vec2 box;out vec2 w;out float k;
void main(){w=q;k=b.z;vec2 d=a.zw;float l=length(d);vec2 n=l>0.?d/l:vec2(0.,-1.);float len=b.x+min(l*.020,b.x*5.);
vec2 p=a.xy+n*q.y*len+vec2(-n.y,n.x)*q.x*b.x;gl_Position=vec4(p.x/box.x*2.-1.,1.-p.y/box.y*2.,0.,1.);}`;
const FRAGMENT = `#version 300 es
precision mediump float;in vec2 w;in float k;out vec4 o;
void main(){float a=max(0.,1.-length(w));o=vec4((vec3(1.,.30,.05)*a*a*.75+vec3(1.,.78,.42)*pow(a,4.)*1.5)*min(1.,k*1.6),0.);}`;

type Ember = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; phase: number };

export class Embers {
  private list: Ember[] = [];
  private data: Float32Array;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private buffer: WebGLBuffer;
  private box: WebGLUniformLocation | null;

  constructor(private gl: WebGL2RenderingContext, private limit: number) {
    this.data = new Float32Array(limit * 7);
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(this.program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    ["q", "a", "b"].forEach((name, i) => gl.bindAttribLocation(this.program, i, name));
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw new Error("embers failed");
    this.box = gl.getUniformLocation(this.program, "box");
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 28, 16);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);
  }

  /** Position in CSS pixels, speed in pixels per second */
  add(x: number, y: number, vx: number, vy: number, life: number, size: number) {
    if (this.list.length < this.limit) this.list.push({ x, y, vx, vy, life, max: life, size, phase: Math.random() * 9 });
  }

  /** w and h are the canvas size in CSS pixels */
  draw(dt: number, t: number, w: number, h: number, wind: number) {
    for (const s of this.list) {
      s.life -= dt;
      s.vx += (Math.sin(t * 5 + s.phase * 3 + s.y * 0.02) * 130 + (Math.random() - 0.5) * 200 + wind * 160) * dt;
      s.vy -= 30 * dt;
      s.vx *= 1 - dt * 0.9;
      s.vy *= 1 - dt * 0.25;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
    this.list = this.list.filter((s) => s.life > 0 && s.y > -20);
    if (!this.list.length) return;
    this.list.forEach((s, i) => {
      const k = s.life / s.max;
      this.data.set([s.x, s.y, s.vx, s.vy, (1.5 + 1.3 * k) * s.size, 0, k * (0.75 + 0.25 * Math.sin(t * 22 + s.phase * 7))], i * 7);
    });
    const { gl } = this;
    gl.useProgram(this.program);
    gl.uniform2f(this.box, w, h);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data, 0, this.list.length * 7);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.list.length);
    gl.disable(gl.BLEND);
  }
}
