#!/usr/bin/env node
// Usage: node engine/render.mjs <spec.json> [--format 9:16] [--out out/file.mp4] [--preview]
// Renders a JSON storyboard frame-by-frame (deterministic, no dropped frames) to MP4 via ffmpeg.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename, isAbsolute } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const specPath = resolve(args[0] || "");
if (!args[0] || !existsSync(specPath)) { console.error("Usage: node engine/render.mjs <spec.json> [--format 16:9|9:16|1:1|4:5] [--out file.mp4] [--preview]"); process.exit(1); }

const spec = JSON.parse(readFileSync(specPath, "utf8"));
if (opt("--format")) spec.format = opt("--format");
const brandPath = resolve(dirname(specPath), spec.brand || resolve(here, "../brand/ams.json"));
const brand = JSON.parse(readFileSync(brandPath, "utf8"));
// Resolve local image paths relative to the spec file.
for (const s of spec.scenes) for (const k of ["before", "after", "image"])
  if (s[k] && !/^(https?|data|file):/.test(s[k])) s[k] = pathToFileURL(isAbsolute(s[k]) ? s[k] : resolve(dirname(specPath), s[k])).href;

const tag = (spec.format || "16:9").replace(":", "x");
const out = resolve(opt("--out") || resolve(here, `../out/${basename(specPath, ".json")}_${tag}.mp4`));
mkdirSync(dirname(out), { recursive: true });

const T0=Date.now(),dbg=(m)=>process.env.MG_DEBUG&&console.log(((Date.now()-T0)/1e3).toFixed(1)+"s",m);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
page.on("pageerror", (e) => { console.error("Composition error:", e.message); process.exit(2); });
await page.goto(pathToFileURL(resolve(here, "player.html")).href);dbg("loaded");
const mg = await page.evaluate(([s, b]) => { const m = buildComposition(s, b); return { width: m.width, height: m.height, fps: m.fps, duration: m.duration }; }, [spec, brand]);
await page.setViewportSize({ width: mg.width, height: mg.height });
await page.evaluate(() => document.fonts.ready);dbg("fonts ready "+JSON.stringify(mg));

if (args.includes("--preview")) { // Contact sheet: one still per second, for quick review
  const png = out.replace(/\.mp4$/, "_preview.png");
  const shots = [];
  for (let t = 0.5; t < mg.duration; t += Math.max(1, mg.duration / 12)) { await page.evaluate((x) => __mg.seek(x), t); shots.push(await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: mg.width, height: mg.height } })); }
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-i", "-", "-vf", `scale=480:-1,tile=4x${Math.ceil(shots.length / 4)}`, "-frames:v", "1", png], { stdio: ["pipe", "inherit", "inherit"] });
  for (const b of shots) ff.stdin.write(b); ff.stdin.end();
  await new Promise((r) => ff.on("close", r)); await browser.close(); console.log("Preview:", png); process.exit(0);
}

const frames = Math.round(mg.duration * mg.fps);
console.log(`Rendering ${mg.width}x${mg.height} @${mg.fps}fps, ${mg.duration.toFixed(1)}s (${frames} frames) -> ${out}`);
const ffArgs = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(mg.fps), "-i", "-"];
if (spec.audio) ffArgs.push("-i", resolve(dirname(specPath), spec.audio), "-shortest", "-c:a", "aac", "-b:a", "192k");
ffArgs.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", out);
const ff = spawn("ffmpeg", ffArgs, { stdio: ["pipe", "inherit", "inherit"] });
for (let i = 0; i < frames; i++) {
  await page.evaluate((x) => __mg.seek(x), i / mg.fps);
  const buf = await page.screenshot({ type: "jpeg", quality: 95, clip: { x: 0, y: 0, width: mg.width, height: mg.height } });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % mg.fps === 0) process.stdout.write(`\r${Math.round((i / frames) * 100)}%`);
}
ff.stdin.end();
const code = await new Promise((r) => ff.on("close", r));
await browser.close();
if (code !== 0) { console.error("\nffmpeg failed"); process.exit(code); }
console.log(`\rDone: ${out}`);
