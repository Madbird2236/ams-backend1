# Proven techniques: VOX-1 «Rollout Schweiz» and Maestro animatic (permanent)

Recovered 2026-10-22 from the repo. Only what the source files prove is written here.

**Correction to the brief:**
- «Swiss map + kinetic type + orchestra» is **two projects**, not one: VOX-1 (map) and
  the Maestro animatic (orchestra).
- Both were made in this Claude Code session (Julia, Claude Opus) and committed.
- Nothing else with a Swiss map or an orchestra exists in the repo, its history,
  or on this machine.
- If another version was made elsewhere (Mac, claude.ai, another tool), it is not
  here and is not described.

| | VOX-1 «Rollout Schweiz» | Maestro animatic «Der Dirigent» |
|---|---|---|
| Output | `creative/motion-lab/03-exercises/AMS_VOX-1_rollout-schweiz.mp4` (17.5 s, 1080×1350, 30 fps, AAC) | `creative/calibration/02-motion/AMS_maestro_animatic_15s.mp4` (15 s, 1080×1350, 30 fps, AAC) |
| Source | `motion/lab/vox1.html` (211 lines) + `lablib.js`, `lab.css`, `ch-data.js`, `icons.js`, `sfx.py` | `motion/calibration/maestro.html` (237 lines) + `lib.js`, `base.css`, `synth.py` |
| Commit | `ac9ea68` (2026-10-22 00:44) | `70d280a` (2026-10-21 23:58) |
| Evaluation | `creative/motion-lab/03-exercises/EVALUATION.md` (Adriano: approved as progress) | `creative/calibration/02-motion/EVALUATION.md` |

## 1. Model

- Code written by **Claude Opus** (Julia agent) in Claude Code.
- **No image or video AI model** was used: 0 Higgsfield credits.
- Every pixel is drawn by code.
- Voice: Piper TTS «Thorsten» (local, CC0). Sound: synthesised with numpy.

## 2. Graphics engine

The AMS engine is `motion/engine/render-html.mjs`:
- an HTML page exposes `window.COMP` and `window.seek(t)`;
- Playwright drives headless **Chromium**, which seeks frame by frame and screenshots;
- **FFmpeg** (image2pipe → libx264, yuv420p, CRF 17) encodes the frames.

It renders in **Chromium**, not a game engine. Option `--blur N` adds motion blur
by sub-frame averaging.

## 3. Libraries (versions in `motion/node_modules`)

| Library | Version | Used for |
|---|---|---|
| GSAP + DrawSVGPlugin + MorphSVGPlugin | 3.13.0 | Master timeline, line drawing, shape morphing (baton → stand, baton → key) |
| three.js (classic build) | 0.150.1 | VOX-1: extruded 3D cantons, pins, route tube, camera tilt |
| topojson-client | 3.1.0 | Decoding the Swiss topology |
| swiss-maps | 4.7.0 | **swisstopo** cantons, lakes and country outline (embedded as `lab/ch-data.js`, 477 KB) |
| Phosphor icons | 2.1.1 | Icons (translate, storefront, moon, calendar, users), inlined as SVG in `icons.js` |
| Fonts | — | Inter Display Bold/Black/Thin, Inter, Geist 700 (logo), JetBrains Mono (numbers, tags) |

`d3-geo`, `animejs` and `opentype.js` are installed but **not used** in these two pieces.

## 4. How the code is built (the pattern that works)

1. **One paused GSAP master timeline is the single source of truth.**
   `mount(tl, dur)` sets `window.seek = t => tl.seek(t)`.
   - Every state is a pure function of time, so the renderer can jump to any frame.
   - Preview stills and the final film are identical.
2. **Fixed beat grid.**
   - Maestro: `B = 0.5` (120 BPM); every key event sits on a beat (off note 2.0,
     crash 3.0, taps 5.5/5.75, one light per beat 9.5–12.0, final chord 12.0).
   - The sound (`synth.py`) uses the same times, so picture and sound cannot drift.
3. **Voice-anchored times.**
   - VOX-1 places beats at word onsets (`x2 = 3.4 + O`, `x3w = [...]`) with a
     global offset `O`.
4. **`show(e, t)`.** Every element is invisible until its start time (`autoAlpha`
   0 → 1). This avoids the GSAP trap where `from`/`fromTo` shows the from-state
   before the start.
5. **Masked word headlines.**
   - `words()` wraps each word in an overflow-hidden mask.
   - Words rise `yPercent: 115 → 0` with `expo.out`, staggered on the beat.
6. **3D driven through proxies (VOX-1).**
   - GSAP animates plain objects: camera `C = {px, py, pz, tx, ty, tz}`, lift
     `L.lift`, light `L.light`, fades, route progress.
   - `onSeek` copies them into three.js and renders: exact seeking, no
     `requestAnimationFrame`.
7. **HTML overlay pinned to 3D.**
   - Labels, city names and storefront icons are DOM elements positioned every
     frame by projecting 3D points (`proj()`).
   - Type stays crisp HTML while following the moving map.
8. **Real data, honestly labelled.**
   - swisstopo geometry and real city coordinates.
   - A «Beispiel» tag and a source line («© swisstopo · Sprachregionen vereinfacht ·
     Städte = Beispiel»).
9. **Deterministic randomness.** A seeded `rnd()` (mulberry32) gives the same
   scatter on every render.

## 5. How the transitions are built: object becomes object

| Transition | Technique | Meaning |
|---|---|---|
| Baton → music stand (Maestro 2.5–3.4) | `morphSVG` of the baton path into the pole; legs and desk `drawSVG` on; the group rotates around the foot with `bounce.out` + screen shake | The wrong entry knocks things over |
| Sheets → one score (5.75–6.4) | 12 sheets fly to one rectangle with `expo.inOut`, scaling to the page size | Chaos → order |
| Notes → Bauprogramm bars (7.75) | Note pairs stretch into rounded bars (`scaleX` from the left); a playhead sweeps | Score = construction schedule |
| **Staves → ceiling light lines** (8.5–9.3) | Six staff lines are lifted above the page and their endpoints animated (`attr x1 y1 x2 y2`) into perspective lines to a vanishing point; the store draws itself dashed | Strongest idea: the music becomes the building |
| Lights on the beat (9.5–12.0) | Each beat: a line turns white + glow, one plane fills, a shelf goes solid, goods pop | Each «voice» completes one part of the store |
| Baton → key (12.15–13.25) | Line draws, `morphSVG` into the key shaft, ring and teeth draw on, rotate `back.out` | Loop: slide 1 → slide 5 |
| Headline → chapter label (VOX-1 2.2) | `scale .42` to the top-left corner | Signposting |
| Flat map → 3D (VOX-1 5.2) | The camera proxy tilts, cantons extrude (`scale.z` = lift), pins drop with `back.out`, the route tube draws by `setDrawRange` | The camera move is the argument: plan → execution |
| Push-in + nightfall (VOX-1 8.8) | Camera into Lausanne, a night gradient fades in, scene lights dim, the pin glows, annotations come in on the voice | Zoom in = go deeper |

## 6. Rendering

- Command: `node engine/render-html.mjs <page.html> --out x.mp4 --audio a.wav` (VOX-1 used `--blur` for motion blur, per `04-TOOL-AUDIT.md`)
 .
- Format: 1080×1350 (4:5), 30 fps, H.264 CRF 17, AAC 192k.
- Loudness: normalised afterwards with `engine/loudnorm.sh` (−14 LUFS, TP −1.5).
  This came from Adriano's review: the first files peaked above 0 dBFS.

## 7. Creative decisions that made the result good

1. **Every move carries meaning.** Transitions are object-to-object
   transformations that tell the story (chaos → order → schedule → building).
   They are not zooms or wipes.
2. **One fact per beat** (VOX-1). Hierarchy by highlight, and a counter (0 → 3)
   that lands on the voice.
3. **Rhythm is designed.** Sound, type and events share one grid.
4. **Restraint.**
   - Palette: AMS blues (#3FA3D6, #6FB9DF, #BFE0F2, #1E293B) on warm paper/dark
     hall.
   - Two type families; generous negative space.
5. **Honesty is part of the look:** example tags, source line, safe claims.
6. **Official logo**, negative or positive by contrast, never boxed.

## 8. Known weaknesses (from the evaluations; do not repeat)

**VOX-1:**
- fact error: three language regions; there are four (now in the claims register);
- weak light-blue contrast on paper;
- oversized Lausanne pin;
- the end card covers the map;
- the source line is 18 px (too small).

**Maestro:**
- the vector world is abstract (for timing, not final);
- a 14-word subline lasts 1.4 s (unreadable);
- no human beat;
- the synthetic sound misses the «Sinfonie» tool-sound twist;
- the TTS voice is German, not Swiss.

**Both:** the sync relied on estimated word timing (faster-whisper word timestamps now
exist in the Higgsfield sandbox).

## 9. Reuse

- **Templates:**
  - `motion/calibration/lib.js` (`words`, `logoSVG`, `mount`);
  - `motion/lab/lablib.js` (`show`, `chars`, `svgEl`, `div`);
  - `vox1.html` `shapesOf()` + `proj()` (any Swiss map: cantons, pins, routes).
- **For 3D architecture:** `motion/pipeline3d/` (ARCH-01) adds HDR post, materials,
  shadows and a camera rail. Combine it with the GSAP master-timeline pattern above
  when a piece needs both type and 3D.
