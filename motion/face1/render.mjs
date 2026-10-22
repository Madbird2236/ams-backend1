// FACE-1 renderer for the Higgsfield sandbox (Playwright + SwiftShader WebGL). Usage:
//   node eng/render.mjs comp/face1.html --out video.mp4            (full render)
//   node eng/render.mjs comp/face1.html --preview --times 1,5,9 --out prev.jpg --w 170
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const args = process.argv.slice(2), opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const comp = resolve(args[0]), out = resolve(opt("--out"));
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"] });
const page = await browser.newPage();
page.on("pageerror", (e) => { console.error("Composition error:", e.message); process.exit(2); });
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.error("console:", m.text()); });
await page.goto(pathToFileURL(comp).href);
await page.waitForFunction(() => window.COMP && window.seek, null, { timeout: 60000 });
const c = await page.evaluate(() => window.COMP);
await page.setViewportSize({ width: c.width, height: c.height });
await page.evaluate(() => document.fonts.ready);
const shot = () => page.screenshot({ type: "jpeg", quality: 92, clip: { x: 0, y: 0, width: c.width, height: c.height } });
const t0 = Number(opt("--from") || 0), t1 = Number(opt("--to") || c.duration);
if (args.includes("--preview")) {
  const ts = (opt("--times") || "").split(",").map(Number);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-i", "-", "-vf", `scale=${opt("--w") || 180}:-1,tile=${ts.length}x1:padding=4`, "-frames:v", "1", out], { stdio: ["pipe", "inherit", "inherit"] });
  for (const t of ts) { await page.evaluate((x) => window.seek(x), t); ff.stdin.write(await shot()); }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r)); await browser.close(); console.log("preview ok"); process.exit(0);
}
const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(c.fps), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "16", out], { stdio: ["pipe", "inherit", "inherit"] });
const n0 = Math.round(t0 * c.fps), n1 = Math.round(t1 * c.fps);
for (let i = n0; i < n1; i++) { await page.evaluate((x) => window.seek(x), i / c.fps); const b = await shot(); if (!ff.stdin.write(b)) await new Promise((r) => ff.stdin.once("drain", r)); if (i % 60 == 0) console.log("frame", i); }
ff.stdin.end(); await new Promise((r) => ff.on("close", r)); await browser.close(); console.log("done", out);
