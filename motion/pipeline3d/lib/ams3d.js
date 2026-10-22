// AMS 3D pipeline library (classic script, three r150 global THREE).
// Reusable pieces for programmatic architectural animation:
//   AMS3D.renderer()   deterministic WebGL renderer (no tone mapping here; the post pass does it)
//   AMS3D.Post         HDR post: bloom (3 mips), ACES, chromatic aberration, vignette, grain, dither
//   AMS3D.tex.*        procedural canvas textures (concrete, oak, plaster) with roughness + normal
//   AMS3D.planeSplit() splits one material into "before" / "after" by a moving world plane, with a seam line
//   AMS3D.CameraPath   Catmull-Rom camera rail (position + target) driven by an eased time curve
//   AMS3D.env()        image-based lighting from a procedural light box (PMREM, core only)
// Everything is a pure function of time t: seek(t) must give the same frame every time (frame-exact render).
(function () {
  const T = THREE;
  const A = {};

  // ---------- time helpers ----------
  A.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  A.prog = (t, s, d) => A.clamp((t - s) / d);
  A.lerp = (a, b, k) => a + (b - a) * k;
  A.smooth = (k) => { k = A.clamp(k); return k * k * (3 - 2 * k); };
  A.inOut = (k) => { k = A.clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  A.out = (k) => 1 - Math.pow(1 - A.clamp(k), 3);
  A.back = (k, s = 1.6) => { k = A.clamp(k) - 1; return 1 + (s + 1) * k * k * k + s * k * k; };

  // deterministic random
  A.rng = (seed) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  // ---------- renderer ----------
  A.renderer = (canvas, w, h) => {
    const r = new T.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    r.setPixelRatio(1); r.setSize(w, h, false);
    r.outputEncoding = T.LinearEncoding;          // linear HDR into the post chain
    r.toneMapping = T.NoToneMapping;
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
    r.physicallyCorrectLights = true;
    return r;
  };

  // ---------- image-based lighting from a procedural light box ----------
  A.env = (renderer, { warm = "#fff1df", sky = "#dfe8f2", floor = "#6b625a", strength = 1 } = {}) => {
    const s = new T.Scene();
    const box = new T.Mesh(new T.BoxGeometry(20, 8, 20), new T.MeshBasicMaterial({ side: T.BackSide, color: new T.Color(floor).multiplyScalar(.35 * strength) }));
    s.add(box);
    const panel = (c, i, w, h, p, r) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(i * strength), side: T.DoubleSide })); m.position.set(...p); m.rotation.set(...r); s.add(m); };
    panel(sky, 6, 14, 6, [0, 2, 9.9], [0, Math.PI, 0]);      // shop window (daylight)
    panel(warm, 4, 2, 14, [-3, 3.9, 0], [Math.PI / 2, 0, 0]); // ceiling light lines
    panel(warm, 4, 2, 14, [3, 3.9, 0], [Math.PI / 2, 0, 0]);
    const pm = new T.PMREMGenerator(renderer);
    const rt = pm.fromScene(s, 0.02);
    pm.dispose();
    return rt.texture;
  };

  // ---------- procedural textures ----------
  function field(S, rnd, octs) {          // value-noise fBm, tileable
    const H = new Float32Array(S * S);
    const lat = (n) => { const g = new Float32Array(n * n); for (let i = 0; i < g.length; i++) g[i] = rnd(); return g; };
    const L = octs.map(([n, a]) => ({ n, a, g: lat(n) }));
    const sm = (t) => t * t * (3 - 2 * t);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      let h = 0;
      for (const o of L) {
        const fx = x / S * o.n, fy = y / S * o.n, xi = Math.floor(fx), yi = Math.floor(fy), u = sm(fx - xi), v = sm(fy - yi), n = o.n, g = o.g;
        const a = g[(yi % n) * n + xi % n], b = g[(yi % n) * n + (xi + 1) % n], c = g[((yi + 1) % n) * n + xi % n], d = g[((yi + 1) % n) * n + (xi + 1) % n];
        h += o.a * (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v);
      }
      H[y * S + x] = h;
    }
    let mn = 1e9, mx = -1e9; for (const v of H) { if (v < mn) mn = v; if (v > mx) mx = v; }
    for (let i = 0; i < H.length; i++) H[i] = (H[i] - mn) / (mx - mn);
    return H;
  }
  const canvasOf = (S, fn) => { const c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d"); const im = g.createImageData(S, S); fn(im.data); g.putImageData(im, 0, 0); return c; };
  function normalFrom(S, H, k) {
    return canvasOf(S, (d) => { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4, hx = H[y * S + (x + 1) % S] - H[y * S + (x - 1 + S) % S], hy = H[((y + 1) % S) * S + x] - H[((y - 1 + S) % S) * S + x];
      const nx = -hx * k, ny = hy * k, l = Math.hypot(nx, ny, 1);
      d[i] = (nx / l * .5 + .5) * 255; d[i + 1] = (ny / l * .5 + .5) * 255; d[i + 2] = (1 / l * .5 + .5) * 255; d[i + 3] = 255; } });
  }
  const texOf = (c, srgb, rep) => { const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 8; t.encoding = srgb ? T.sRGBEncoding : T.LinearEncoding; return t; };

  A.tex = {
    // raw concrete: blotchy grey, pores, form-work seams
    concrete(rep = [1, 1], seed = 7, S = 512) {
      const r = A.rng(seed), H = field(S, r, [[4, .3], [16, .3], [64, .25], [128, .15]]), P = field(S, r, [[128, .6], [256, .4]]);
      const al = canvasOf(S, (d) => { for (let i = 0; i < S * S; i++) { const h = H[i], pore = P[i] < .16 ? .8 : 1, v = (128 + h * 34 + (P[i] - .5) * 14) * pore; d[i * 4] = v; d[i * 4 + 1] = v * .985; d[i * 4 + 2] = v * .96; d[i * 4 + 3] = 255; } });
      const ro = canvasOf(S, (d) => { for (let i = 0; i < S * S; i++) { const v = 200 + H[i] * 50; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; } });
      return { map: texOf(al, true, rep), roughnessMap: texOf(ro, false, rep), normalMap: texOf(normalFrom(S, P.map((p, i) => p * .7 + H[i] * .3), 2.2), false, rep) };
    },
    // oak planks along u, grain + per-plank tone; finished floor
    oak(rep = [1, 1], seed = 3, S = 1024, planks = 8) {
      const r = A.rng(seed), G = field(S, r, [[2, .4], [16, .3], [64, .3]]), tone = Array.from({ length: planks * 4 }, () => .86 + r() * .2);
      const al = canvasOf(S, (d) => { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const pk = Math.floor(y / S * planks), off = (pk * 0.37) % 1, seg = Math.floor(((x / S + off) % 1) * 2), k = tone[pk * 2 + seg];
        const grain = .5 + .5 * Math.sin((y / S * planks * 40) + G[y * S + x] * 14), gap = ((y % (S / planks)) < 2 || Math.abs(((x / S + off) % .5) * S) < 1.5) ? .55 : 1;
        const i = (y * S + x) * 4, v = k * gap * (.9 + .1 * grain);
        d[i] = 196 * v; d[i + 1] = 156 * v; d[i + 2] = 112 * v; d[i + 3] = 255; } });
      const ro = canvasOf(S, (d) => { for (let i = 0; i < S * S; i++) { const v = 95 + G[i] * 40; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; } });
      return { map: texOf(al, true, rep), roughnessMap: texOf(ro, false, rep), normalMap: texOf(normalFrom(S, G, 1.2), false, rep) };
    },
    // fine plaster / gypsum micro-relief (normal only), for painted walls
    plaster(rep = [1, 1], seed = 5, S = 512) {
      const r = A.rng(seed), H = field(S, r, [[32, .5], [128, .3], [256, .2]]);
      return { normalMap: texOf(normalFrom(S, H, 1.5), false, rep) };
    },
  };

  // ---------- before/after split by a moving world plane ----------
  // dir: world axis ("x"|"y"|"z"); after-side = coord < uPlane. seam: emissive line colour at the plane.
  // One shared uniform object drives every material in the scene.
  A.extraShader = {};   // tag -> fn(shader): scene-specific additions on top of the split
  A.sweep = { uPlane: { value: -1e6 }, uSeam: { value: 0 }, uSeamCol: { value: new T.Color("#ffd9a0") }, uWidth: { value: .05 } };
  A.makeSweep = (col = "#ffd9a0", width = .05) => ({ uPlane: { value: -1e6 }, uSeam: { value: 0 }, uSeamCol: { value: new T.Color(col) }, uWidth: { value: width } });
  A.planeSplit = (mat, side, axis = "z", tag = "", U = A.sweep) => {
        mat.onBeforeCompile = (sh, r) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vSWP;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\n#ifdef USE_INSTANCING\nvSWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\n#else\nvSWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
        varying vec3 vSWP; uniform float uPlane, uSeam, uWidth; uniform vec3 uSeamCol;`)
        .replace("void main() {", `void main() {
        float sd = vSWP.${axis} - uPlane;                       // >0 = before (raw), <0 = after (finished)
        float jag = sin(vSWP.x * 7.0 + vSWP.y * 5.0) * 0.012;  // seam is not CG-straight
        ${side === "before" ? "if (sd + jag < 0.0) discard;" : side === "after" ? "if (sd + jag >= 0.0) discard;" : ""}`)
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        totalEmissiveRadiance += uSeamCol * uSeam * (exp(-abs(sd + jag) / uWidth) * 6.0 + exp(-abs(sd + jag) / (uWidth * 8.0)) * 0.35);`);
      if (A.extraShader[tag]) A.extraShader[tag](sh);
    };
    mat.customProgramCacheKey = () => "split-" + side + axis + tag;
    return mat;
  };

  // ---------- camera rail ----------
  A.CameraPath = class {
    constructor(camera, keys) {   // keys: [{t, p:[x,y,z], q:[x,y,z] (target), fov?}]
      this.c = camera; this.k = keys;
      this.P = new T.CatmullRomCurve3(keys.map((k) => new T.Vector3(...k.p)), false, "centripetal");
      this.Q = new T.CatmullRomCurve3(keys.map((k) => new T.Vector3(...k.q)), false, "centripetal");
    }
    at(t, ease = A.inOut) {
      const k = this.k, t0 = k[0].t, t1 = k[k.length - 1].t, u = ease(A.clamp((t - t0) / (t1 - t0)));
      this.c.position.copy(this.P.getPoint(u)); this.c.lookAt(this.Q.getPoint(u));
      if (k[0].fov) { const f = A.lerp(k[0].fov, k[k.length - 1].fov, u); if (f !== this.c.fov) { this.c.fov = f; this.c.updateProjectionMatrix(); } }
    }
  };

  // ---------- post-processing ----------
  const VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const BRIGHT = `uniform sampler2D tSrc; uniform float uTh; varying vec2 vUv;
    void main(){ vec3 c = texture2D(tSrc, vUv).rgb; float l = max(max(c.r, c.g), c.b); gl_FragColor = vec4(c * max(l - uTh, 0.0) / max(l, 1e-4), 1.0); }`;
  const BLUR = `uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
    void main(){ vec3 s = texture2D(tSrc, vUv).rgb * 0.227;
      s += (texture2D(tSrc, vUv + uDir * 1.385).rgb + texture2D(tSrc, vUv - uDir * 1.385).rgb) * 0.316;
      s += (texture2D(tSrc, vUv + uDir * 3.231).rgb + texture2D(tSrc, vUv - uDir * 3.231).rgb) * 0.070;
      gl_FragColor = vec4(s, 1.0); }`;
  const FINAL = `uniform sampler2D tSrc, tB1, tB2, tB3; uniform float uBloom, uExp, uVig, uGrain, uCA, uTime, uLift; uniform vec3 uTint; varying vec2 vUv;
    vec3 aces(vec3 x){ x *= 0.6; return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime * 37.0) * 43758.5453); }
    void main(){
      vec2 d = vUv - 0.5; float r2 = dot(d, d);
      vec3 c; c.r = texture2D(tSrc, vUv - d * uCA * r2).r; c.g = texture2D(tSrc, vUv).g; c.b = texture2D(tSrc, vUv + d * uCA * r2).b;
      vec3 b = texture2D(tB1, vUv).rgb * 0.5 + texture2D(tB2, vUv).rgb * 0.3 + texture2D(tB3, vUv).rgb * 0.2;
      c = (c + b * uBloom) * uExp * uTint;
      c = aces(c);
      c = pow(c, vec3(1.0 / 2.2));
      c = c * (1.0 - uLift) + uLift;
      c *= 1.0 - uVig * smoothstep(0.08, 0.55, r2 * 1.6);
      c += (h(gl_FragCoord.xy) - 0.5) * uGrain;
      c += (h(gl_FragCoord.xy + 17.0) - 0.5) / 255.0;          // dither: no banding in dark gradients
      gl_FragColor = vec4(c, 1.0); }`;

  A.Post = class {
    constructor(renderer, w, h, o = {}) {
      this.r = renderer; this.w = w; this.h = h;
      const gl = renderer.getContext();
      const half = renderer.capabilities.isWebGL2 || renderer.extensions.has("EXT_color_buffer_half_float");
      const type = half ? T.HalfFloatType : T.UnsignedByteType;
      this.hdr = new T.WebGLRenderTarget(w, h, { type, samples: renderer.capabilities.isWebGL2 ? (o.msaa ?? 4) : 0 });
      this.mips = [2, 4, 8].map((s) => [0, 1].map(() => new T.WebGLRenderTarget(Math.ceil(w / s), Math.ceil(h / s), { type, minFilter: T.LinearFilter, magFilter: T.LinearFilter })));
      const mk = (fs, u) => new T.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms: u, depthTest: false, depthWrite: false });
      this.mBright = mk(BRIGHT, { tSrc: { value: null }, uTh: { value: o.threshold ?? 1.0 } });
      this.mBlur = mk(BLUR, { tSrc: { value: null }, uDir: { value: new T.Vector2() } });
      this.mFinal = mk(FINAL, { tSrc: { value: null }, tB1: { value: null }, tB2: { value: null }, tB3: { value: null },
        uBloom: { value: o.bloom ?? .6 }, uExp: { value: o.exposure ?? 1 }, uVig: { value: o.vignette ?? .35 }, uGrain: { value: o.grain ?? .025 },
        uCA: { value: o.ca ?? .006 }, uTime: { value: 0 }, uLift: { value: o.lift ?? .01 }, uTint: { value: new T.Color(o.tint ?? "#ffffff") } });
      this.quad = new T.Mesh(new T.PlaneGeometry(2, 2)); this.qs = new T.Scene(); this.qs.add(this.quad); this.qc = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.info = { hdr: type === T.HalfFloatType ? "half-float" : "8-bit", msaa: this.hdr.samples };
    }
    pass(m, target) { this.quad.material = m; this.r.setRenderTarget(target); this.r.render(this.qs, this.qc); }
    render(scene, camera, t) {
      const r = this.r; r.setRenderTarget(this.hdr); r.render(scene, camera);
      let src = this.hdr.texture;
      this.mips.forEach(([a, b], i) => {
        if (i === 0) { this.mBright.uniforms.tSrc.value = src; this.pass(this.mBright, a); }
        else { this.mBlur.uniforms.tSrc.value = src; this.mBlur.uniforms.uDir.value.set(0, 0); this.pass(this.mBlur, a); }
        this.mBlur.uniforms.tSrc.value = a.texture; this.mBlur.uniforms.uDir.value.set(1 / a.width, 0); this.pass(this.mBlur, b);
        this.mBlur.uniforms.tSrc.value = b.texture; this.mBlur.uniforms.uDir.value.set(0, 1 / a.height); this.pass(this.mBlur, a);
        src = a.texture;
      });
      const u = this.mFinal.uniforms;
      u.tSrc.value = this.hdr.texture; u.tB1.value = this.mips[0][0].texture; u.tB2.value = this.mips[1][0].texture; u.tB3.value = this.mips[2][0].texture; u.uTime.value = t;
      this.pass(this.mFinal, null);
    }
  };

  window.AMS3D = A;
})();
