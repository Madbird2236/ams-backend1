#!/usr/bin/env node
// Renders a self-contained HTML composition frame by frame to MP4.
// The page must define window.COMP = {width, height, fps, duration} and window.seek(t).
// Usage: node engine/render-html.mjs <comp.html> --out out/x.mp4 [--audio a.wav] [--preview]
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const comp = resolve(args[0]);
const out = resolve(opt("--out") || comp.replace(/\.html$/, ".mp4"));
mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
page.on("pageerror", (e) => { console.error("Composition error:", e.message); process.exit(2); });
page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
await page.goto(pathToFileURL(comp).href);
await page.waitForFunction(() => window.COMP && window.seek);
const c = await page.evaluate(() => window.COMP);
await page.setViewportSize({ width: c.width, height: c.height });
await page.evaluate(() => document.fonts.ready);

const shot = () => page.screenshot({ type: "jpeg", quality: 95, clip: { x: 0, y: 0, width: c.width, height: c.height } });
const pipe = (ffArgs) => spawn("ffmpeg", ffArgs, { stdio: ["pipe", "inherit", "inherit"] });

if (args.includes("--preview")) { // contact sheet at the given times or every 0.5 s
  const times = (opt("--times") || "").split(",").filter(Boolean).map(Number);
  const ts = times.length ? times : Array.from({ length: Math.floor(c.duration * 2) }, (_, i) => i * 0.5 + 0.25);
  const png = out.replace(/\.mp4$/, "_preview.jpg");
  const cols = Number(opt("--cols") || 6);
  const ff = pipe(["-y", "-loglevel", "error", "-f", "image2pipe", "-i", "-", "-vf", `scale=${Number(opt("--w") || 300)}:-1,tile=${cols}x${Math.ceil(ts.length / cols)}:padding=4`, "-frames:v", "1", "-q:v", "3", png]);
  for (const t of ts) { await page.evaluate((x) => window.seek(x), t); ff.stdin.write(await shot()); }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r)); await browser.close(); console.log("Preview:", png); process.exit(0);
}

// --blur N: motion blur by supersampling (render N sub-frames per frame and average them)
const N = Math.max(1, Number(opt("--blur") || 1));
const frames = Math.round(c.duration * c.fps) * N;
const ffArgs = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(c.fps * N), "-i", "-"];
if (opt("--audio")) ffArgs.push("-i", resolve(opt("--audio")), "-c:a", "aac", "-b:a", "192k", "-shortest");
if (N > 1) ffArgs.push("-vf", `tmix=frames=${N},fps=${c.fps}`);
ffArgs.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "17", "-movflags", "+faststart", out);
const ff = pipe(ffArgs);
for (let i = 0; i < frames; i++) {
  await page.evaluate((x) => window.seek(x), i / (c.fps * N));
  const buf = await shot();
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
}
ff.stdin.end();
const code = await new Promise((r) => ff.on("close", r));
await browser.close();
if (code !== 0) { console.error("ffmpeg failed"); process.exit(code); }
console.log("Done:", out);
