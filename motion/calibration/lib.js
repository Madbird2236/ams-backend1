// Shared helpers for calibration compositions (deterministic: GSAP only, seeded randomness).
const NS = "http://www.w3.org/2000/svg";
function rnd(seed) { // mulberry32
  return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}
// Headline made of masked words: returns the inner spans for animation.
function words(container, text, cls = "") {
  const box = document.createElement("div"); box.className = "hl " + cls;
  text.split("\n").forEach((line) => {
    const l = document.createElement("div"); l.className = "ln";
    line.split(" ").forEach((w, i) => {
      const m = document.createElement("span"); m.className = "m";
      const s = document.createElement("span"); s.className = "w"; s.textContent = w;
      m.appendChild(s); l.appendChild(m); if (i < line.split(" ").length - 1) l.appendChild(document.createTextNode(" "));
    });
    box.appendChild(l);
  });
  container.appendChild(box);
  return { box, w: [...box.querySelectorAll(".w")] };
}
// Official AMS logo (website SVG), negative variant: official blue symbol, white text.
function logoSVG(width, textColor = "#FFFFFF") {
  return `<svg viewBox="0 0 252 48" xmlns="${NS}" style="display:block;width:${width}px;color:${textColor}">
  <path d="M24 4 L24 21 L13.5 38 L3 44 Z" fill="#BFE0F2"/><path d="M24 4 L24 21 L34.5 38 L45 44 Z" fill="#6FB9DF"/>
  <path d="M3 44 L13.5 38 L34.5 38 L45 44 Z" fill="#3FA3D6"/><rect x="58" y="9" width="2.4" height="30" rx="1.2" fill="#1E96CF"/>
  <text x="72" y="22" font-family="Geist" font-weight="700" font-size="17" letter-spacing="-0.3" fill="currentColor">AMS</text>
  <text x="72" y="40" font-family="Geist" font-weight="700" font-size="17" letter-spacing="-0.4" fill="currentColor">Malergeschäft</text></svg>`;
}
function mount(tl, dur, w = 1080, h = 1350, fps = 30) {
  tl.pause(0);
  window.COMP = { width: w, height: h, fps, duration: dur };
  window.seek = (t) => { tl.seek(t, false); };
}
