"""Ground-plane camera tracking (KLT + PnP) on an image sequence.
Assumptions (stated, not measured): focal length f, camera height h, horizon row y_h on frame 0.
Usage: python3 track_ground.py frames_dir first last out.json [f] [h] [y_h]"""
import sys, glob, json, cv2, numpy as np
d, a, b, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
f = float(sys.argv[5]) if len(sys.argv) > 5 else 900.0
h = float(sys.argv[6]) if len(sys.argv) > 6 else 1.6
yh = float(sys.argv[7]) if len(sys.argv) > 7 else 600.0
files = sorted(glob.glob(d + "/*.png"))[a - 1:b]
g0 = cv2.cvtColor(cv2.imread(files[0]), cv2.COLOR_BGR2GRAY); H, W = g0.shape
K = np.array([[f, 0, W / 2], [0, f, H / 2], [0, 0, 1]], float)
# camera at (0,0,h) looking forward (+Y) pitched up by alpha so that the horizon lands on y_h
alpha = np.arctan((yh - H / 2) / f)
# world->camera rotation (camera x=right, y=down, z=forward); world X right, Y forward, Z up
Rx = np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0]], float)          # level camera
Rp = np.array([[1, 0, 0], [0, np.cos(alpha), np.sin(alpha)], [0, -np.sin(alpha), np.cos(alpha)]])  # pitch up
R0 = Rp @ Rx; C0 = np.array([0, 0, h]); t0 = -R0 @ C0
mask = np.zeros_like(g0); mask[int(yh + 60):, :] = 255
p0 = cv2.goodFeaturesToTrack(g0, 400, .01, 8, mask=mask)
def backproject(pts):
    rays = (np.linalg.inv(K) @ np.c_[pts, np.ones(len(pts))].T).T @ R0   # camera->world direction (R0^T * v)
    s = -C0[2] / rays[:, 2]; return C0 + rays * s[:, None]
P = backproject(p0.reshape(-1, 2)); ok = (P[:, 1] > 0) & (P[:, 1] < 60)
p0, P = p0[ok], P[ok]; print("valid ground points", len(P), "Y range", P[:,1].min().round(1) if len(P) else None, P[:,1].max().round(1) if len(P) else None)
rvec, _ = cv2.Rodrigues(R0); tvec = t0.reshape(3, 1).copy(); poses = []; prev = g0; pts = p0.copy(); alive = np.ones(len(pts), bool)
for i, fn in enumerate(files):
    g = cv2.cvtColor(cv2.imread(fn), cv2.COLOR_BGR2GRAY)
    if i > 0:
        nxt, st, err = cv2.calcOpticalFlowPyrLK(prev, g, pts, None, winSize=(21, 21), maxLevel=3)
        back, st2, _ = cv2.calcOpticalFlowPyrLK(g, prev, nxt, None, winSize=(21, 21), maxLevel=3)
        fb = np.linalg.norm((pts - back).reshape(-1, 2), axis=1)
        alive &= (st.ravel() == 1) & (st2.ravel() == 1) & (fb < 1.2)
        pts = nxt
    if i > 0 and i % 4 == 0 and alive.sum() < 250:   # replenish: new ground features, back-projected with the current pose
        Rc, _ = cv2.Rodrigues(rvec); Cc = (-Rc.T @ tvec).ravel()
        hz = K @ (Rc @ (np.array([0, 1e4, 0]) - Cc)); yhz = hz[1] / hz[2]
        m = np.zeros_like(g); m[int(min(H - 50, yhz + 60)):, :] = 255
        for q in pts[alive].reshape(-1, 2): cv2.circle(m, (int(q[0]), int(q[1])), 8, 0, -1)
        new = cv2.goodFeaturesToTrack(g, 300, .01, 8, mask=m)
        if new is not None:
            rays = (np.linalg.inv(K) @ np.c_[new.reshape(-1, 2), np.ones(len(new))].T).T @ Rc
            sc = -Cc[2] / rays[:, 2]; Pn = Cc + rays * sc[:, None]; okn = (sc > 0) & (Pn[:, 1] < Cc[1] + 60)
            P = np.vstack([P, Pn[okn]]); pts = np.vstack([pts, new[okn].astype(np.float32)]); alive = np.r_[alive, np.ones(okn.sum(), bool)]
    idx = np.where(alive)[0]
    if len(idx) < 8:
        print('lost track at frame', a + i, 'alive', len(idx)); break
    okp, rvec, tvec, inl = cv2.solvePnPRansac(P[idx].astype(np.float32), pts[idx].reshape(-1, 2).astype(np.float32), K, None,
                                              rvec, tvec, useExtrinsicGuess=True, reprojectionError=2.0, iterationsCount=200)
    ninl = 0 if inl is None else len(inl)
    proj, _ = cv2.projectPoints(P[idx][inl.ravel()] if ninl else P[idx], rvec, tvec, K, None)
    rms = float(np.sqrt(((proj.reshape(-1, 2) - pts[idx][inl.ravel()].reshape(-1, 2)) ** 2).sum(1).mean())) if ninl else 99
    if ninl:  # drop outliers for good (moving people, shadows)
        bad = np.setdiff1d(idx, idx[inl.ravel()]); alive[bad] = False
    R, _ = cv2.Rodrigues(rvec); poses.append({"R": R.tolist(), "t": tvec.ravel().tolist(), "inliers": ninl, "rms": round(rms, 3)})
    prev = g
json.dump({"K": K.tolist(), "W": W, "H": H, "first": a, "poses": poses}, open(out, "w"))
print("frames", len(poses), "inliers first/last", poses[0]["inliers"], poses[-1]["inliers"], "rms max", max(p["rms"] for p in poses))
print("rms every 12:", [p["rms"] for p in poses[::12]]); print("inliers every 12:", [p["inliers"] for p in poses[::12]])
