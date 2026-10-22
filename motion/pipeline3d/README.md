# AMS 3D pipeline (programmatic motion design)

Code-only 3D animation: three.js scene → Chromium (headless, software WebGL) → FFmpeg.
There is no AI video and no prompt-to-video. Every frame is a pure function of `t`,
so a render is reproducible frame for frame, and every source file in this folder
can be verified.

**Tested environment (2026-10-22):**
- Chromium 141 at `/opt/pw-browsers/chromium` (SwiftShader WebGL2: half-float targets, MSAA 4×);
- three r150.1 (`motion/node_modules/three`, classic build);
- FFmpeg 6.1, Node Playwright.

## Specialities (who does what)

| Role | Owns | Files |
|---|---|---|
| Creative direction | idea, beat sheet, craft truth, what is *not* shown | `briefs/*.md` |
| 3D development | geometry, materials, light, camera rail, transformation logic | `scenes/*.html`, `lib/ams3d.js` |
| Rendering | frame-exact capture, motion blur (sub-frame supersampling), encode | `../engine/render-html.mjs` |
| Compositing | HDR post (bloom, ACES, CA, vignette, grain), type, sound, loudness | `lib/ams3d.js` (`Post`), `audio/*.py`, `../engine/loudnorm.sh` |
| Quality control | objective checks + independent frame review (separate agent) | `qc/qc.py`, `../../creative/motion-lab/03-exercises/*/QC-REPORT.md` |

## Library (`lib/ams3d.js`, global `AMS3D`)

- `renderer()`: deterministic linear-HDR renderer with soft shadows and physically
  correct lights. Tone mapping happens in the post pass, not here.
- `env()`: image-based lighting from a procedural light box (PMREM, core three only).
- `tex.concrete / oak / plaster`: procedural textures (albedo, roughness, normal), tileable.
- `planeSplit(mat, "before"|"after", axis, tag, sweep)`: one world plane splits every
  material into raw and finished, with a glowing seam. `extraShader[tag]` adds
  scene-specific shading on top (e.g. boards → paint lag).
- `CameraPath`: Catmull-Rom rail for position and target, eased in time, with optional
  FOV animation.
- `Post`:
  - HDR target (half float, MSAA);
  - 3-mip bloom;
  - ACES;
  - radial chromatic aberration;
  - vignette;
  - grain;
  - dither (no banding).
- Time helpers: `prog`, `smooth`, `inOut`, `out`, `back`, plus the seeded `rng`.

## Run (from `motion/`)

```bash
CHROMIUM_PATH=/opt/pw-browsers/chromium node engine/render-html.mjs pipeline3d/scenes/arch01-schnitt.html \
  --out out/arch01/a.mp4 --preview --times 0,1.5,3,4.5,5.9 --cols 5      # look-dev stills
pipeline3d/build.sh pipeline3d/scenes/arch01-schnitt.html pipeline3d/audio/sfx_arch01.py out/arch01 2   # full build + QC
```

## Rules this pipeline keeps

- No Wan (any version).
- AI video, when a project needs it, is Seedance 2.5 only. This pipeline needs none.
- No presenter, voice or lip-sync unless the brief asks.
- Craft order is shown truthfully (studs → boards → paint; ceiling closed before light).
- QC must pass before a human sees the film.
- Learnings go to `creative/LEARNINGS.md`.
- Three gotchas:
  - In `seek(t)`, never use `fromTo`-style states that exist before their start.
  - Raw props hide their shadow once fully cut (shadow maps ignore `discard`).
  - `scene.add()` returns the scene, not the object.

## Integration analysis (external repos)

See `INTEGRATION.md`.
