# External repos: what was analysed, what was adopted, what is blocked (2026-10-22)

## 1. Status of the two repos

| Repo | Status | Notes |
|---|---|---|
| `xdis/opus-video-studio` | cloned to `/home/user/xdis/opus-video-studio` (outside the AMS repo, read-only, **never executed**) | analysed below |
| `yihui-dev/awesome-opus5-5-videos` | **not cloned**: `add_repo` was refused by the session's security layer ([Untrusted Code Integration]) | contents unknown; not analysed. Nothing in this pipeline claims to reproduce its examples |

## 2. opus-video-studio: techniques and how they map to AMS

| Their technique | Where | AMS decision |
|---|---|---|
| Frame-exact render: page exposes `draw(t)`; Chromium screenshots each frame and pipes it to ffmpeg (image2pipe, libx264, bt709 tags) | `tools/code_anim/render.py` | **Already equivalent** in `motion/engine/render-html.mjs` (`seek(t)`, image2pipe), which adds motion blur by sub-frame supersampling. No need to run theirs |
| Three.js template (torus knot, three 0.160 from jsdelivr via importmap) | `three_template.html` | **Not usable here**: jsdelivr is blocked in this sandbox and ES modules fail over `file://`. AMS uses the local classic three r150 build |
| House explainer: floor plan → CAD → walls rise → tour → sun study; ACES, PCF soft shadows 4096, eased camera keys | `kp03_house.html` | **Adopted as ideas, rewritten**: eased camera keys → `CameraPath` (Catmull-Rom); "walls rise" → `planeSplit` + rising fixtures; ACES moved into our own HDR post pass with bloom |
| Code-synthesised SFX (pop/tick/whoosh/thud/rise/chime), amix −9 dB, limiter | `tools/code_anim/sfx.py` | **Adopted as a principle**: `audio/sfx_arch01.py` derives every sound event from the scene's own timeline (no drift), then two-pass loudnorm |
| edge-tts narration timeline driving the visuals | `render.py` | Not needed for ARCH-01 (no voice). Useful for explainers later; AMS presenter voice stays Seedance 2.5 / ElevenLabs as per CLAUDE.md |
| Route B: FLUX.2 klein + **Wan 2.2** 5B (local) | `tools/mlx_wan22_i2v.py`, docs | **Rejected**: Wan is forbidden for AMS |
| Mac-specific paths (`channel='chrome'`, `.venv`, MLX) | several | Do not apply to this Linux sandbox |

## 3. The security block (not bypassed)

**What was refused:** one Bash call that would have
1. edited `tools/code_anim/render.py` line ~79, and
2. executed that third-party script.

The command, exactly:

```bash
cd /home/user/xdis/opus-video-studio && \
sed -i "s|b = pw.chromium.launch(channel='chrome', args=|b = pw.chromium.launch(**({'executable_path': os.environ['CHROME_PATH']} if os.environ.get('CHROME_PATH') else {'channel': 'chrome'}), args=|" tools/code_anim/render.py && \
CHROME_PATH=/opt/pw-browsers/chromium python3 tools/code_anim/render.py scripts/kp01.json --stills 19.5
```

**Why it is blocked:** `pw.chromium.launch(channel='chrome')` requires Google Chrome,
which does not exist here. Only the Playwright Chromium does, at
`/opt/pw-browsers/chromium`.

**The Chromium change needed:** in `render.py`, replace `channel='chrome'` with
`executable_path='/opt/pw-browsers/chromium'`. Keep the args
`--allow-file-access-from-files --force-color-profile=srgb`.
The kp templates also load three from jsdelivr, which this network blocks, so a
vendored local copy would be needed too.

**Minimal permission that would unblock it (only if Adriano wants to run the
third-party code):**
- one-time approval of that exact Bash command, scoped to
  `/home/user/xdis/opus-video-studio`;
- no network, no write outside that folder, no change to AMS configuration.

**Recommendation:** not needed. The AMS engine already does what `render.py` does and is
proven by the self-test and by ARCH-01. Running unreviewed third-party Python adds
risk without adding capability.

## 4. Self-test of the AMS renderer (isolated, our own code)

- One-second three.js scene (rotating blue cube) rendered by `engine/render-html.mjs`
  in a scratch folder.
- Result: h264 640×360, 30 frames.
- Frames are non-black, with 18,578 blue cube pixels.
- The frame-to-frame difference is 6.2, so the motion is real.
- The first attempt rendered black because of a bug in the test scene
  (`scene.add(light).position.set(…)` moved the whole scene), not in the renderer.
  It was caught by the pixel check, which is why a test must check pixels, not just
  "file exists".
