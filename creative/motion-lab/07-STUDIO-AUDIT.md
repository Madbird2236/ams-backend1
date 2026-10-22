# Studio audit: environment, external repos, what is operational (2026-10-22)

Rule: installed ≠ operational. A tool is ✅ only when a functional test in this
environment produced a verified output.

## 1. Environment (this cloud session; not Adriano's Mac)

| Item | Found | Functional test | Status |
|---|---|---|---|
| OS | Ubuntu 24.04.5 LTS, kernel 6.18 | — | ✅ |
| CPU / RAM / disk | 4 vCPU, 15 GiB RAM, ~21 GB free | — | ✅ (enough for 1080p code renders) |
| GPU | **none** (no `/dev/dri`, no PCI VGA) | WebGL runs on SwiftShader (CPU) | ⚠ works, slow: ARCH-01 1080×1920 with shadows + HDR + MSAA ≈ 1.3 s per sub-frame |
| Node.js / npm | v22.22.0 / 10.9.4 | engine runs | ✅ |
| Python | 3.13.16; numpy 2.5, scipy 1.18, OpenCV 5.0, Playwright (py) | sound synthesis + QC ran | ✅ |
| FFmpeg / ffprobe | 6.1.1 | encode, mux, loudnorm, ebur128 | ✅ |
| Chromium (Playwright) | 141.0.7390.37 at `/opt/pw-browsers/chromium` | self-test MP4 with pixel check (see 2) | ✅ |
| Google Chrome | **not installed** (`channel='chrome'` impossible) | — | ❌ (not needed) |
| Playwright (Node) | 1.56.1 | drives every render | ✅ |
| three.js | 0.150.1 (classic build; no `examples/js`; ES modules blocked over `file://`) | ARCH-01, 3D-1, MACRO-1 | ✅ (post-processing written in-house) |
| GSAP (+ DrawSVG, MorphSVG) | 3.13.0 | VOX-1, Maestro, KT-1 | ✅ |
| swiss-maps / topojson-client / d3-geo | 4.7.0 / 3.1.0 / 3.1.1 | VOX-1 map | ✅ (d3-geo installed, unused so far) |
| React Three Fiber | not installed | — | not needed: frame-exact `seek(t)` is simpler without React |
| Blender | **not installed** | — | ❌. Install only when a project needs it (heavy); the Higgsfield 3D scene builder is an alternative |
| edge-tts | `/usr/local/bin/edge-tts` | not run (network policy unknown for that host; voice route for AMS is Seedance/ElevenLabs anyway) | untested |
| Higgsfield sandbox | Playwright + SwiftShader + ffmpeg + internet | FACE-1 assembled there | ✅ (for cloud assets) |
| Network | npm/pypi allowed; cloudfront, jsdelivr, upload.higgsfield blocked locally | — | constraint: vendor all libraries locally |

## 2. Renderer self-test (isolated, our own code)

- `engine/render-html.mjs` rendered a 1 s three.js test scene from the scratchpad.
- Result: H.264 640×360, 30 frames.
- A pixel check found 18,578 blue pixels on the cube and a frame-to-frame
  difference of 6.2. **PASS.**
- The first run was black because of a bug in the test scene, not the renderer.
  This is why tests check pixels, not file existence.

## 3. External repositories

| Repo | Installed | Accessible | Role decided |
|---|---|---|---|
| `xdis/opus-video-studio` | cloned at `/home/user/xdis/opus-video-studio` (read-only, outside the AMS repo) | yes, read | **Infrastructure reference.** Its route A (code animation) matches our engine; its techniques are adopted in our own code (`motion/pipeline3d/INTEGRATION.md`) |
| `yihui-dev/awesome-opus5-5-videos` | **no** | **no**: `add_repo` refused by the session's security layer ([Untrusted Code Integration]) | Intended as a reference library. **Not analysed: nothing is known about its contents** |

**opus-video-studio official test (`tools/smoke_test.sh`) was not run.**
- It is a zsh script for a Mac (Apple M4 Pro per its docs).
- It executes third-party code. It calls `render.py`, which uses
  `channel='chrome'` (absent here) and loads three.js from jsdelivr (blocked here).
- It checks Wan 2.2 and FLUX models, which AMS forbids or does not use.
- Running the same scripts was refused earlier by the session's security classifier.
- Not bypassed. What would make it applicable is in `motion/pipeline3d/INTEGRATION.md`
  §3.

**Its skills, assessed for reuse:**

| Skill | Reuse for AMS |
|---|---|
| `video-explainer` (2D code) | ✅ same principle as our VOX/KT work |
| `video-floorplan` (Three.js plan → 3D → tour) | ✅ ideas adopted in `pipeline3d` (camera keys, walls rise, ACES, soft shadows) |
| `video-lineart` (Blender line art) | later, if Blender is installed |
| `video-idea` (router) | ✅ principle: choose the route first, as in our production-route rule |
| `video-char-mv`, `video-talk`, `video-skit`, `video-quote` | ❌ depend on FLUX + **Wan 2.2** (forbidden) |

## 4. To unblock awesome-opus (Adriano decides)

1. In claude.ai, give this environment GitHub access to
   `yihui-dev/awesome-opus5-5-videos`, then approve `add_repo` when asked; **or**
2. Explicitly authorise a read-only fetch of its public README and example pages. No
   code would be executed; it would be used only as a reference.
