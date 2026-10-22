#!/usr/bin/env python3
"""AMS video QC: objective checks on a rendered MP4, before any human review.

usage: python3 qc.py video.mp4 [--expect 1080x1920@30] [--dur 6] [--out report_dir]

Checks (each one PASS / WARN / FAIL):
  spec      codec h264, yuv420p, resolution, fps, duration, audio stream present
  black     frames with mean luma < 8 (unintended black)
  flash     single-frame luma jumps (pops / flicker): |Δmean| > 12 vs both neighbours
  cut       frame-difference spikes > 6× median (unintended hard changes in a one-shot)
  freeze    runs of near-identical frames > 1.5 s (pre-flight 6i: no hold without micro-life)
  clip      share of pixels ≥ 250 (blown highlights) and ≤ 4 (crushed blacks) per frame
  loudness  EBU R128 integrated (target −14 LUFS ±1) and true peak (≤ −1.0 dBTP)
Writes qc.json, qc.md, a 12-frame contact sheet and a luma/motion graph.
"""
import argparse, json, os, re, subprocess, sys
import cv2, numpy as np

ap = argparse.ArgumentParser(); ap.add_argument("video"); ap.add_argument("--expect", default="1080x1920@30"); ap.add_argument("--dur", type=float); ap.add_argument("--out")
a = ap.parse_args()
out = a.out or os.path.splitext(a.video)[0] + "_qc"; os.makedirs(out, exist_ok=True)
R = []
def res(name, status, detail): R.append({"check": name, "status": status, "detail": detail})

# ---- spec ----
pr = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", a.video]))
v = next(s for s in pr["streams"] if s["codec_type"] == "video"); au = [s for s in pr["streams"] if s["codec_type"] == "audio"]
w, h = int(v["width"]), int(v["height"]); num, den = map(int, v["r_frame_rate"].split("/")); fps = num / den
dur = float(pr["format"]["duration"])
ew, eh, efps = re.match(r"(\d+)x(\d+)@(\d+)", a.expect).groups()
ok = v["codec_name"] == "h264" and v["pix_fmt"] == "yuv420p" and (w, h) == (int(ew), int(eh)) and abs(fps - int(efps)) < .01
res("spec", "PASS" if ok else "FAIL", f'{v["codec_name"]} {v["pix_fmt"]} {w}x{h} @ {fps:g} fps, {dur:.3f} s, audio: {au[0]["codec_name"] + " " + au[0].get("channel_layout", "") if au else "none"}')
if a.dur: res("duration", "PASS" if abs(dur - a.dur) < 1.5 / fps + .05 else "FAIL", f"{dur:.3f} s vs expected {a.dur} s")
if not au: res("audio", "WARN", "no audio stream")

# ---- per-frame analysis ----
cap = cv2.VideoCapture(a.video); L, Dm, CLh, CLl, frames = [], [], [], [], []
prev = None; i = 0; N = int(v.get("nb_frames", 0)) or int(dur * fps)
pick = set(np.linspace(0, N - 1, 12).round().astype(int).tolist())
while True:
    okf, f = cap.read()
    if not okf: break
    g = cv2.cvtColor(cv2.resize(f, (w // 4, h // 4), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY).astype(np.float32)
    L.append(float(g.mean())); CLh.append(float((g >= 250).mean())); CLl.append(float((g <= 4).mean()))
    Dm.append(0.0 if prev is None else float(np.abs(g - prev).mean())); prev = g
    if i in pick: frames.append((i, f))
    i += 1
L, Dm = np.array(L), np.array(Dm); n = len(L)
blk = np.where(L < 8)[0]
res("black", "PASS" if len(blk) == 0 else "FAIL", f"{len(blk)} black frames" + (f" at {blk[:10].tolist()}" if len(blk) else ""))
fl = [k for k in range(1, n - 1) if abs(L[k] - L[k - 1]) > 12 and abs(L[k] - L[k + 1]) > 12]
res("flash", "PASS" if not fl else "FAIL", f"{len(fl)} single-frame luma pops" + (f" at frames {fl[:10]}" if fl else ""))
med = float(np.median(Dm[1:])) if n > 2 else 0
sp = [k for k in range(1, n) if Dm[k] > max(6 * med, 3.0)]
res("cut", "PASS" if not sp else "WARN", f"median motion {med:.2f}, spikes > 6× at frames {sp[:10]}" if sp else f"median motion {med:.2f}, no spikes")
still = Dm < .15; run = best = 0; at = 0
for k in range(n):
    run = run + 1 if still[k] else 0
    if run > best: best, at = run, k
res("freeze", "PASS" if best / fps <= 1.5 else "FAIL", f"longest near-static run {best / fps:.2f} s" + (f" ending frame {at}" if best else ""))
hc, lc = float(np.max(CLh)), float(np.max(CLl))
res("clip", "PASS" if hc < .02 and lc < .05 else "WARN", f"max blown {hc * 100:.2f} % (frame {int(np.argmax(CLh))}), max crushed {lc * 100:.2f} % (frame {int(np.argmax(CLl))})")

# ---- loudness ----
if au:
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", a.video, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", e)[-1]); TP = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)[-1])
    res("loudness", "PASS" if abs(I + 14) <= 1 and TP <= -1.0 else "WARN", f"integrated {I} LUFS, true peak {TP} dBTP")

# ---- visuals ----
tiles = []
for k, f in frames:
    t = cv2.resize(f, (270, int(270 * h / w))); cv2.putText(t, f"{k / fps:.2f}s", (8, 26), cv2.FONT_HERSHEY_SIMPLEX, .7, (255, 255, 255), 2); tiles.append(t)
while len(tiles) % 6: tiles.append(np.zeros_like(tiles[0]))
sheet = np.vstack([np.hstack(tiles[r:r + 6]) for r in range(0, len(tiles), 6)])
cv2.imwrite(os.path.join(out, "contact.jpg"), sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])
G = np.full((260, 900, 3), 255, np.uint8); x = (np.arange(n) / max(n - 1, 1) * 880 + 10).astype(int)
for arr, col, sc in [(L, (40, 40, 40), 255), (Dm, (200, 90, 30), max(Dm.max(), 1e-3))]:
    y = (250 - arr / sc * 240).astype(int)
    for k in range(1, n): cv2.line(G, (x[k - 1], y[k - 1]), (x[k], y[k]), col, 2)
cv2.putText(G, "grey = mean luma, orange = frame-to-frame motion", (10, 18), cv2.FONT_HERSHEY_SIMPLEX, .5, (0, 0, 0), 1)
cv2.imwrite(os.path.join(out, "graph.png"), G)

worst = "FAIL" if any(r["status"] == "FAIL" for r in R) else "WARN" if any(r["status"] == "WARN" for r in R) else "PASS"
json.dump({"video": a.video, "frames": n, "result": worst, "checks": R}, open(os.path.join(out, "qc.json"), "w"), indent=1)
md = [f"# QC — {os.path.basename(a.video)}", "", f"**Result: {worst}** ({n} frames)", "", "| check | status | detail |", "|---|---|---|"] + [f'| {r["check"]} | {r["status"]} | {r["detail"]} |' for r in R]
open(os.path.join(out, "qc.md"), "w").write("\n".join(md) + "\n")
print("\n".join(md))
sys.exit(1 if worst == "FAIL" else 0)
