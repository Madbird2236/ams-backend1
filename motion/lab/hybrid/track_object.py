"""2D object track by KLT inside a hand-set box on the first frame (median motion + scale from point spread), smoothed.
Usage: python3 track_object.py frames_dir first last x0 y0 x1 y1 out.json"""
import sys, glob, json, cv2, numpy as np
d, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); x0, y0, x1, y1 = map(float, sys.argv[4:8]); out = sys.argv[8]
files = sorted(glob.glob(d + "/*.png"))[a - 1:b]
prev = cv2.cvtColor(cv2.imread(files[0]), cv2.COLOR_BGR2GRAY)
m = np.zeros_like(prev); m[int(y0):int(y1), int(x0):int(x1)] = 255
pts = cv2.goodFeaturesToTrack(prev, 120, .01, 4, mask=m)
box = np.array([(x0 + x1) / 2, y0, x1 - x0, y1 - y0], float); track = [box.tolist()]; lost = []
for fn in files[1:]:
    g = cv2.cvtColor(cv2.imread(fn), cv2.COLOR_BGR2GRAY)
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, pts, None, winSize=(15, 15), maxLevel=3)
    back, st2, _ = cv2.calcOpticalFlowPyrLK(g, prev, nxt, None, winSize=(15, 15), maxLevel=3)
    ok = (st.ravel() == 1) & (st2.ravel() == 1) & (np.linalg.norm((pts - back).reshape(-1, 2), axis=1) < 1.0)
    a0, a1 = pts[ok].reshape(-1, 2), nxt[ok].reshape(-1, 2)
    dxy = np.median(a1 - a0, axis=0)
    s0 = np.median(np.linalg.norm(a0 - a0.mean(0), axis=1)); s1 = np.median(np.linalg.norm(a1 - a1.mean(0), axis=1))
    sc = s1 / s0 if s0 > 1 else 1.0
    box = np.array([box[0] + dxy[0], box[1] + dxy[1] - (sc - 1) * 0, box[2] * sc, box[3] * sc]); track.append(box.tolist()); lost.append(int(ok.sum()))
    pts = a1.reshape(-1, 1, 2).astype(np.float32)
    if len(pts) < 40:   # refresh points inside the current box
        mm = np.zeros_like(g); cx, ty, w, h = box; mm[int(ty):int(ty + h), int(cx - w / 2):int(cx + w / 2)] = 255
        new = cv2.goodFeaturesToTrack(g, 120, .01, 4, mask=mm)
        if new is not None: pts = np.vstack([pts, new.astype(np.float32)])
    prev = g
arr = np.array(track); sm = arr.copy()
for c in range(4): sm[:, c] = np.convolve(np.pad(arr[:, c], 3, mode="edge"), np.ones(7) / 7, mode="valid")
json.dump({"first": a, "track": sm.tolist()}, open(out, "w"))
print("frames", len(arr), "min points", min(lost), "x range", arr[:, 0].min().round(), arr[:, 0].max().round(), "scale", (arr[-1, 2] / arr[0, 2]).round(2))
