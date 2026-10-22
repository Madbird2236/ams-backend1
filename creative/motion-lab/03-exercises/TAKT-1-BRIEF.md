# TAKT-1 «Eine Linie. Ein Takt.» — quality proof (7.5 s, 1080×1920, 30 fps, 2D programmatic)

**Objective:** prove the studio can make programmatic motion design at the level of the
best code-rendered Opus pieces:
- true continuous motion;
- object-to-object transitions with no cuts or fades;
- beat-locked type;
- frame-inspected.

**Audience:** B2B, a teaser for rollout work. **References:** VOX-1 (Swiss vector map,
composition) and Maestro (beat grid, staff lines, rhythm). They are not merged into
one story: the map simply *becomes* the score.

**Idea:** the Swiss border is drawn as one line. The line unravels into a musical staff,
and the notes land where the cities are. The country becomes a rhythm, and the rhythm
lands as the promise.

**Style (restraint):**
- Paper #EEEAE2, ink #1E293B, AMS blue #3FA3D6 (only accent), light blue #BFE0F2.
- Inter Display Black for headlines, JetBrains Mono for labels.
- Critically damped springs (no overshoot).
- Banned: glows, particle bursts, shockwave rings, camera shake, RGB split, crossfades,
  bouncy easing.
- Motion blur: 4 sub-frames + tmix.

**Grid:** 120 BPM, beat = 0.5 s; each move starts ≈0.05 s before its beat.

| t (s) | Beat | Picture | Text | Sound |
|---|---|---|---|---|
| 0.0 | 1 | First frame complete: blue dot on Geneva, label GENF, headline «Eine Linie.» | «Eine Linie.» | soft pad in |
| 0.1–2.4 | 1–5 | The border draws from Geneva at accelerating speed. The camera follows the pen head close (2.4× zoom), then pulls out to the whole country. Canton borders draw in behind (thin ink) | — | rising filtered pen sound |
| 2.4–3.0 | 5–6 | Whole map; headline leaves upward | — | — |
| 3.0–3.8 | 7–8 | **Transition:** the border unravels in a wave into 5 staff lines; cantons retract | «Ein Takt.» | swell, tick on 3.0 |
| 3.5–4.5 | 8–10 | 5 notes land on eighth beats; x = longitude, y = latitude snapped to line/space (Genf, Lausanne, Bern, Basel, Zürich) | city labels (mono) | one pluck per note, pitch = staff height |
| 4.75–5.3 | 10–11 | A playhead sweeps; each note fills blue as it is passed | — | kick + pluck per note |
| 5.4–5.9 | 11–12 | **Transition:** the staff lines converge into one line; notes become dots on it | — | whoosh-down |
| 5.75–6.5 | 12–14 | Words rise out of the line, one per beat | «Auf den Takt genau.» («genau.» blue) | kick per word |
| 6.6–7.5 | 14–16 | Logo (original blue) under the line; slow drift (micro-life) | source line «Karte: © swisstopo» | final chord |

**Craft and claim check:**
- Cities are geographic markers only, not claimed projects.
- No numbers or claims about language regions.
- The copy «Auf den Takt genau.» is already approved (Maestro end card).
