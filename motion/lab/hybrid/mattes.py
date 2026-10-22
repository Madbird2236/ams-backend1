"""Per-frame person matte (rembg u2netp on a crop that follows the tracked vest). Writes RGBA-free alpha PNGs.
Usage: python3 mattes.py frames_dir track.json outdir"""
import sys, glob, json, os, cv2, numpy as np
from rembg import remove, new_session
d, tj, out = sys.argv[1:4]; os.makedirs(out, exist_ok=True)
T = json.load(open(tj)); a = T["first"]; files = sorted(glob.glob(d + "/*.png")); sess = new_session("u2netp")
for k, (cx, ty, w, h) in enumerate(T["track"]):
    im = cv2.imread(files[a - 1 + k]); H, W = im.shape[:2]
    x0, x1 = int(max(0, cx - 1.1 * w)), int(min(W, cx + 1.1 * w)); y0, y1 = int(max(0, ty - .7 * h)), int(min(H, ty + 3.4 * h))
    crop = cv2.cvtColor(im[y0:y1, x0:x1], cv2.COLOR_BGR2RGB)
    m = np.array(remove(crop, session=sess, only_mask=True))
    full = np.zeros((H, W), np.uint8); full[y0:y1, x0:x1] = m
    cv2.imwrite(f"{out}/{a + k:04d}.png", cv2.GaussianBlur(full, (0, 0), .8))
print("mattes", len(T["track"]))
