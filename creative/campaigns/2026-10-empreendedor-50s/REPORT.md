# «Erfolg wird gebaut»: production report (2026-10-22)

**Deliverable:** `AMS_Erfolg-wird-gebaut_50s.mp4`
- Format: 1080×1920, 30 fps, 50.0 s, H.264 + AAC 256k, −14.0 LUFS.
- Location: Higgsfield media library, media id `f45ea32c-936c-4e96-ad27-6f03365b14f2`.
- URL: https://d2ol7oe51mr4n9.cloudfront.net/user_30vgSUYtwrbLkwjxgBk2WrT5VCV/f45ea32c-936c-4e96-ad27-6f03365b14f2.mp4
- This environment cannot reach Higgsfield's CDN, so the MP4 lives in the Higgsfield
  library. All sources are in this folder.

## Route
- **100 % code**: Canvas 2D + DOM kinetic type in one HTML page, every frame a pure
  function of t.
- Rendered by headless Chromium → FFmpeg, with motion blur from 2 sub-frames + `tmix`.
- The only AI is the **voice**: Higgsfield text2speech_v2 (ElevenLabs engine), Adriano's
  voice element «Ams-».
- No avatar, no lip-sync, no AI video, no Wan.

## Pipeline (reproducible)
1. Voice
   - `audio/edit_voice.py`: pauses tightened, +5 % tempo (pitch kept), EQ/compression.
   - Word timestamps from faster-whisper (small, de) → `src/words_final.json`.
2. Picture
   - `src/erfolg.html` + `patch_qc1.py`, `patch_qc2.py`, `patch_qc3.py`: the QC rounds,
     applied in order. `erfolg_built.html` is the result with the timings injected.
   - Fonts in `src/fonts/` (Inter 900/600, JetBrains Mono 500, OFL).
   - Render: `motion/engine/render-html.mjs --blur 2`, or the identical sandbox renderer.
3. Sound
   - `audio/mix.py`:
     - original synthesized music (96 BPM, Am–F–C–G; it drops out on «scheitern?» and
       builds after the turn);
     - SFX on real on-screen events;
     - ducking under the voice;
     - tanh soft-limit.
   - Then `motion/engine/loudnorm.sh`: −14 LUFS, true peak ≤ −1.5.

## Story → metaphor (one blue line carries everything)

| Spoken line | Visual |
|---|---|
| Was macht jemanden … erfolgreichen Unternehmer? | The line draws a question mark |
| Nicht die geniale Idee | The ? morphs into a light bulb, which is struck through in coral |
| Probleme besser lösen als andere | The bulb tangles into a knot; ours unties on «lösen», the other one («ANDERE») stays tangled |
| Fang klein an / Versteh deine Kunden | The line shrinks into a small block; a customer circle appears and a bridge reaches it |
| Liefere mehr, als du versprochen hast | A promise bar fills to «VERSPROCHEN» and runs past it («+ MEHR») |
| Lerne, mit Geld umzugehen / Umsatz beeindruckt | Coins stack, then turn into a revenue column with a CHF counter (1'250'000) |
| … erst der Gewinn hält ein Unternehmen am Leben | Costs fall away in coral; the profit's edge becomes a heartbeat |
| Umgib dich mit klugen Menschen | A network forms around «you» |
| Lerne aus deinen Fehlern | A path hits a wall (✕) and finds the way round |
| Warte nicht auf den perfekten Moment | «PERFEKT» keeps sliding away; the dot goes up: «JETZT» |
| Wirst du scheitern? Natürlich. Mehr als einmal. | The same line falls twice (coral) and rises again; the camera follows it |
| aufgeben / aufbauen | The line forks: one branch flattens to grey, the other climbs |
| Lernen, anpassen, weitermachen | Three steps, each built on its word |
| Erfolg ist kein Zufall. Er wird jeden Tag gebaut. | A die is thrown away; days stack into a block (TAG 1'000); then the end card with the official logo |

## QC performed
- **Objective checks**
  - Spec: h264, yuv420p, 1080×1920, 30 fps, 50.0 s.
  - Loudness: −14.0 LUFS, peak −3.6 dBFS.
- **Sync check** (faster-whisper on the final mix vs the picture's timeline)
  - Median offset 12 ms; 100 of 100 words found.
  - The transcript is correct after one fix: an impact SFX masked «einmal».
- **Frame review: 3 rounds**
  - My own review plus an independent critic subagent (the ams-render-qc-engineer
    role), which had not seen the build.
  - **Round 1: FAIL, 1 blocker + 6 major.** Fixed:
    - official logo;
    - label alpha and size;
    - font preload;
    - the «Geld» beat;
    - line continuity into the falls;
    - end card;
    - CHF counter ghosting.
  - **Round 2:** the camera was outrunning the line. Fixed.
  - **Round 3:** a double image on the moving CHF counter. Fixed.

## Known limits (honest)
- **Voice**
  - Adriano judged the take «sem vida». More generation was stopped, so the energy
    comes from editing, music and SFX, not from a new take.
  - Julia's own storytelling script (in `ROTEIRO.md`) is ready for a future take
    (about 2 credits).
- **Credits spent on audio:** 7.45 in total.
  - Part was waste: two full takes because the language changed (PT → DE), plus six
    short engine tests that showed no measurable gain.
  - Rule learned: one test at most, and confirm the language before generating.
- **Audio judgement:** Julia cannot hear. Levels, sync and transcript were measured;
  the musical taste of the bed needs Adriano's ear.
- **Map data licence** (affects VOX-1/TAKT-1, not this film): swiss-maps says the
  BFS GEOSTAT data is non-commercial. Check before using either in paid media.
