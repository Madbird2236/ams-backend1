"""Split the demo photo into depth layers for 2.5D parallax (works on a copy).
Usage: python3 layers.py photo.jpg outdir"""
import sys, os, cv2, numpy as np
from rembg import remove, new_session
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
img = cv2.imread(src); H, W = img.shape[:2]
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
yy, xx = np.mgrid[0:H, 0:W]

# 1) sky model: smooth polynomial colour field fitted on the top band, robust to the crane
band = (yy < 440)
A = lambda x, y: np.stack([np.ones_like(x), x, y, x*x, y*y, x*y], -1).astype(np.float32)
X = A(xx[band]/W, yy[band]/H); keep = np.ones(len(X), bool)
for _ in range(3):
    coef = [np.linalg.lstsq(X[keep], lab[..., c][band][keep], rcond=None)[0] for c in range(3)]
    pred = np.stack([X @ c for c in coef], -1); err = np.linalg.norm(lab[band] - pred, axis=1)
    keep = err < np.percentile(err[keep], 85)
Xall = A(xx/W, yy/H); sky_pred = np.stack([Xall @ c for c in coef], -1)
dist = np.linalg.norm(lab - sky_pred, axis=-1)
sky = (dist < 9) & (yy < 640)
sky = cv2.morphologyEx(sky.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)

# 2) crane: not-sky pixels in the upper area, away from the left mountains
crane = (~sky) & (yy < 545) & ~((xx < 360) & (yy > 430)) & ((lab[..., 0] - sky_pred[..., 0]) < -10)
crane = cv2.dilate(crane.astype(np.uint8), np.ones((2, 2), np.uint8)).astype(bool)

# 3) foreground: ground below a hand-set horizon line + the four workers (rembg on crops)
def ground_y(x): return np.interp(x, [0, 240, 560, 768], [1005, 940, 935, 975])
fg = yy > ground_y(xx)
sess = new_session("u2netp")
for (x0, y0, x1, y1) in [(245, 815, 330, 1010), (350, 815, 460, 1005), (530, 820, 630, 1070), (645, 820, 745, 1065)]:
    crop = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2RGB)
    m = np.array(remove(crop, session=sess, only_mask=True)) > 110
    fg[y0:y1, x0:x1] |= m
fg = cv2.morphologyEx(fg.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)).astype(bool)

# 4) midground: everything else below the sky that is not crane or foreground
mid = (~sky) & (~crane) & (~fg) & (yy > 420)

def soft(m, r=1.2): return (cv2.GaussianBlur(m.astype(np.float32), (0, 0), r) * 255).astype(np.uint8)
def inpaint(base, hole, r=6): return cv2.inpaint(base, cv2.dilate(hole.astype(np.uint8)*255, np.ones((5, 5), np.uint8)), r, cv2.INPAINT_TELEA)

# far plate: sky + mountains, with everything nearer filled in
skyband = cv2.dilate(sky.astype(np.uint8), np.ones((31, 31), np.uint8)).astype(bool)
far = inpaint(img, crane | (mid & skyband), 7)
cv2.imwrite(f"{out}/L0_far.jpg", far, [cv2.IMWRITE_JPEG_QUALITY, 92])
# crane, mid and fg as RGBA (holes behind nearer layers filled so small shifts reveal no gaps)
def rgba(base, m): o = cv2.cvtColor(base, cv2.COLOR_BGR2BGRA); o[..., 3] = soft(m); return o
cv2.imwrite(f"{out}/L1_crane.png", rgba(img, crane))
midband = cv2.dilate(mid.astype(np.uint8), np.ones((31, 31), np.uint8)).astype(bool)
mid_fill = inpaint(img, fg & midband, 5)
cv2.imwrite(f"{out}/L2_mid.png", rgba(mid_fill, mid | (cv2.dilate(fg.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool) & (yy > 820) & (yy < 1010) & ~sky)))
cv2.imwrite(f"{out}/L3_fg.png", rgba(img, fg))
dbg = img.copy(); dbg[sky] = (dbg[sky]*.4 + np.array([255, 120, 0])*.6); dbg[crane] = (0, 0, 255); dbg[fg] = (dbg[fg]*.5 + np.array([0, 255, 0])*.5)
cv2.imwrite(f"{out}/debug.jpg", dbg)
print("ok", sky.mean().round(3), crane.mean().round(4), mid.mean().round(3), fg.mean().round(3))
