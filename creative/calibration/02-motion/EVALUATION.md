# Calibration 02 — Motion design (2026-10-22)

Local engine only (HTML + GSAP + headless Chromium + ffmpeg). Sound synthesised locally (numpy). Voice: Piper TTS with the «Thorsten» German voice (CC0), run locally. **0 Higgsfield credits.**

## Deliverables
| File | Length | What it proves |
|---|---|---|
| `AMS_maestro_animatic_15s.mp4` | 15 s, 1080×1350, 30 fps, AAC | Full story of carousel v2 with real transformations, beat-synced type, VO |
| `AMS_studie_t1-formschnitt.mp4` | 4 s | Graphic match cut: baton → fallen music stand on the same line |
| `AMS_studie_t2-klebeband.mp4` | 4.5 s | Masking-tape peel as a wipe; the new scene's crisp edge is where the tape was |
| `AMS_studie_t3-takt-typo.mp4` | 4.5 s | Kinetic type: words land off-grid on each beat and snap into the grid on beat 4 |

Sources: `motion/calibration/` (`maestro.html`, `t1–t3*.html`, `synth.py`, `lib.js`), renderer `motion/engine/render-html.mjs`.

## Animatic timeline (120 BPM, one beat = 0.5 s)
| Time | Story beat (storyboard v2) | Motion | Sound |
|---|---|---|---|
| 0–2.5 | Hook: «Ein falscher Einsatz.» | Hall lights fade in from the centre; baton draws; at 2.0 the baton jerks, lights flicker, «falscher» slips off-grid | Murmur → silence, riser, downbeat chord, off note at 2.0 |
| 2.5–3.4 | Transition | Baton **morphs** into the stand's pole, desk and legs draw on, the stand falls and bounces | Crash + timpani on 3.0 |
| 3.0–5.5 | Conflict: «Viele Gewerke. Ein Eröffnungstermin.» | 12 score sheets burst and drift; words land off-beat and crooked | Off-grid wood hits, paper rustle |
| 5.5–6.4 | Transition | Two baton taps; the sheets fly together and become one score page | «tok tok», whoosh |
| 6.4–8.5 | Development: «Jede Stimme hat ihren Einsatz.» | Staves draw, trades label (Gipser, Maler, Ladenbau, Andere Gewerke); notes pop on 1/8 notes; note pairs **stretch into Bauprogramm bars**; playhead sweeps | Kick + hat pulse, plucks per note |
| 8.5–9.3 | Transition | Six staff lines **become the store's ceiling light lines** in perspective; the unfinished store draws itself, dashed, at night (fixes retro finding N3) | Whoosh |
| 9.5–12.0 | Reveal: «Ihre Eröffnung ist eine Partitur.» | One light switches on per beat; each beat completes one part of the store (walls, floor, shelves, goods) | Clack + bell per light, build |
| 12.0–13.3 | Payoff | Doors open on the final chord, light spills out; a baton line appears and **becomes the key** (loop slide 1 → slide 5) | Final chord, door chime |
| 13.0–15.0 | End card | «Ihr Eröffnungstag. / Auf den Takt genau.» word by word on the beat; CTA; official logo (negative variant) | VO «Wir spielen unseren Part.» (12.25) and «Auf den Takt genau.» starting at 13.48, landing with the words |

## Self-evaluation (scores already discounted by ~1 point, per calibration 01)
| Criterion | Score | Evidence |
|---|---|---|
| Fluidity | 3.5 | Eased, overlapping moves; no slide-show cuts. Weak spot: the sheet gather (5.75–6.4) is busy for a moment |
| Continuity | 4 | Every scene hands an object to the next: baton → pole, sheets → page, notes → bars, staves → lights, baton → key |
| Rhythm | 4 | All key events sit on the 120 BPM grid (2.0 off note, 3.0 crash, 5.5/5.75 taps, lights 9.5–12.0, chord 12.0); VO lands with the type |
| Creativity of transitions | 3.5 | Transitions carry meaning (chaos → order, score → schedule → store). Staves-to-lights is the strongest; the stand fall is literal |
| Technical quality | 3 | Clean 1080×1350 H.264 + AAC; contrast measured. But abstract vector look, simple perspective, synthetic sound, 16 kHz TTS voice |
| Storyboard fidelity | 4 | All five beats and the approved copy present; store now unfinished at night |

## What worked
- Real transformations instead of zooms: five object-to-object transformations carry the story.
- Sync is designed, not approximate: the sound and the motion share one beat grid.
- The pre-flight check caught two errors before delivery: hidden headline glyphs peeking through their masks, and white on brand blue in study 2 (measured 2.8:1 → changed to #1E293B, 5.2:1).

## What needs work
1. **Visual world:** the animatic is vector and abstract; the approved carousel is photographic. Good for timing and structure, not final. A final version needs the approved stills/AI footage for the human beats (conductor, hands, key handover).
2. **Reading time:** the approved slide 4 subline (14 words) is on screen for ~1.4 s, too short to read. For motion, shorten it or run 20 s.
3. **No human beat:** the conductor's eyebrow joke and the people are missing, so less emotion and humour than the Reel script.
4. **Sound:** the Sinfonie twist (music made of real tool sounds) is not achieved with synthesis; it needs recorded or licensed tool samples.
5. **Voice:** Thorsten is German, not Swiss, intonation, and low quality (16 kHz). Fine for timing; not for publication. Adriano's Voice Studio is on his computer, not in this cloud environment.
6. **Study 2:** the old wall reads as generic noise, not as worn plaster.
