"use client";

import { useRef, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Shader source
// ---------------------------------------------------------------------------

const VERTEX_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Single fragment shader that lerps between smooth & dithered paths via u_morph
const FRAGMENT_SRC = `
precision highp float;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_morph;       // 0 = smooth, 1 = dithered

// --- Noise params (from issue spec) ---
const float WAVE_SPEED     = 0.05;
const float WAVE_FREQUENCY = 3.0;
const float WAVE_AMPLITUDE = 0.3;
const float COLOR_NUM      = 4.0;
const float PIXEL_SIZE     = 2.0;

// Warm amber derived from Forge accent #c4a882 → darkened for background
const vec3 WAVE_COLOR = vec3(0.40, 0.30, 0.18);

uniform sampler2D u_bayerTex;

// --- Perlin noise helpers ---
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i  = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

const int OCTAVES = 4;
float fbm(vec2 p) {
  float value = 0.0;
  float amp   = 1.0;
  float freq  = WAVE_FREQUENCY;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p    *= freq;
    amp  *= WAVE_AMPLITUDE;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - u_time * WAVE_SPEED;
  return fbm(p + fbm(p2));
}

// --- Dithering ---
vec3 dither(vec2 fragCoord, vec3 color) {
  vec2 scaledCoord = floor(fragCoord / PIXEL_SIZE);
  vec2 bayerUV     = mod(scaledCoord, 8.0) / 8.0;
  float threshold  = texture2D(u_bayerTex, bayerUV).r - 0.25;
  float stepSize   = 1.0 / (COLOR_NUM - 1.0);
  color += threshold * stepSize;
  float bias = 0.2;
  color = clamp(color - bias, 0.0, 1.0);
  return floor(color * (COLOR_NUM - 1.0) + 0.5) / (COLOR_NUM - 1.0);
}

void main() {
  // --- Smooth path (continuous UV) ---
  vec2 uvSmooth = gl_FragCoord.xy / u_resolution;
  uvSmooth -= 0.5;
  uvSmooth.x *= u_resolution.x / u_resolution.y;
  float fSmooth = pattern(uvSmooth);
  vec3 colSmooth = mix(vec3(0.0), WAVE_COLOR, fSmooth);

  // --- Dithered path (pixelated UV) ---
  vec2 normalizedPixelSize = PIXEL_SIZE / u_resolution;
  vec2 uvDither = normalizedPixelSize * floor(gl_FragCoord.xy / PIXEL_SIZE) / u_resolution;
  // re-map to same coordinate space
  uvDither -= 0.5;
  uvDither.x *= u_resolution.x / u_resolution.y;
  float fDither = pattern(uvDither);
  vec3 colDither = mix(vec3(0.0), WAVE_COLOR, fDither);
  colDither = dither(gl_FragCoord.xy, colDither);

  // --- Morph mix ---
  vec3 finalColor = mix(colSmooth, colDither, u_morph);
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Bayer 8×8 ordered-dithering matrix (values 0–63, stored normalised)
const BAYER_8X8 = new Uint8Array([
   0, 48, 12, 60,  3, 51, 15, 63,
  32, 16, 44, 28, 35, 19, 47, 31,
   8, 56,  4, 52, 11, 59,  7, 55,
  40, 24, 36, 20, 43, 27, 39, 23,
   2, 50, 14, 62,  1, 49, 13, 61,
  34, 18, 46, 30, 33, 17, 45, 29,
  10, 58,  6, 54,  9, 57,  5, 53,
  42, 26, 38, 22, 41, 25, 37, 21,
].map((v) => Math.round((v / 64) * 255)));

// ---------------------------------------------------------------------------
// WebGL helpers
// ---------------------------------------------------------------------------

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram {
  const prog = gl.createProgram();
  if (!prog) throw new Error("Failed to create program");
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error(`Program link error: ${info}`);
  }
  return prog;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type ForgeBackgroundProps = {
  /** 0 = smooth smoke, 1 = Bayer-dithered crosses. Transition is eased. */
  morph?: number;
  className?: string;
};

export function ForgeBackground({
  morph = 0,
  className,
}: ForgeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const morphRef = useRef(0);         // current interpolated value
  const morphTargetRef = useRef(morph); // target value from prop

  // Keep target in sync with prop
  useEffect(() => {
    morphTargetRef.current = morph;
  }, [morph]);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      console.warn("ForgeBackground: WebGL not available");
      return;
    }

    // --- Compile & link ---
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    const program = createProgram(gl, vs, fs);
    gl.useProgram(program);

    // --- Fullscreen quad (two triangles) ---
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    // biome-ignore lint/style/noNonNullAssertion: WebGL attribute
    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    // --- Bayer texture ---
    const bayerTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, bayerTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      8,
      8,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      BAYER_8X8,
    );
    const uBayerTex = gl.getUniformLocation(program, "u_bayerTex");
    gl.uniform1i(uBayerTex, 0);

    // --- Uniform locations ---
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMorph = gl.getUniformLocation(program, "u_morph");

    // --- Resize handler ---
    const resize = () => {
      // DPR = 1 per spec
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uResolution, w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // --- Animation loop ---
    let rafId = 0;
    const startTime = performance.now();

    const frame = () => {
      // Ease morph toward target
      const target = morphTargetRef.current;
      const current = morphRef.current;
      const diff = target - current;
      if (Math.abs(diff) > 0.001) {
        morphRef.current += diff * 0.04;
      } else {
        morphRef.current = target;
      }

      const elapsed = (performance.now() - startTime) / 1000;
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uMorph, morphRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      gl.deleteTexture(bayerTex);
      gl.deleteBuffer(posBuffer);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(program);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    };
  }, []);

  useEffect(() => {
    return initWebGL();
  }, [initWebGL]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}
