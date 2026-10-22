# KT-UGC-1: voice-synced kinetic typography on realistic UGC footage (0 credits)

**Files:** `AMS_KT-UGC-1_original.mp4` (source 0–8.25 s, untouched) · `AMS_KT-UGC-1_sync.mp4` (7.4 s, worked version) · `KT-UGC-1-contact-sheet.jpg`
**Source:** Higgsfield demo generation (`creative/references/ugc-ref-01/`); copy only, labelled «KI-generiert · Demo-Material, keine AMS-Referenz».
**Engine:** `motion/lab/ugc/ktugc1.html` (+ `ktugc1-tracks.js`, `sfx_ktugc1.py`). Audio −14.3 LUFS, peak −2.4 dBFS.

## Two text layers, two kinds of sync
| Layer | Language | Sync | Look |
|---|---|---|---|
| Literal | English (= audio) | **Word by word** on the real timestamps; the current word lights in brand blue `#BFE0F2` | Small «EN» transcript line in a soft box: a utility layer |
| Meaning | Swiss Standard German | **Meaning units**, each one timed to the onset of the English unit that carries the same meaning | Kinetic type: in the room, in perspective, or as a hero word |

Timestamps: faster-whisper `small.en` word times, onsets checked against a voicing analysis of the audio (the first transcript had «No» at 4.28 s; the real onset is 4.62 s).

| German unit | English unit | Onset (out) | Treatment |
|---|---|---|---|
| Warum hört man | Why can you hear | 0.24 | line reveal through a mask, on the ceiling (discreet) |
| die Nachbarn | your neighbours | 0.84 | line reveal (discreet) |
| durch eine neue | through a new | 1.26 | line reveal (discreet) |
| **Wand?** | wall? | 1.94 | blue marker + the real wall is outlined, camera-tracked in perspective |
| — | (pause) | 2.22–2.72 | visual pause: question leaves, shot freezes, push-in to the empty cavity, surroundings dim |
| **OHNE** | No | 2.72 | stamped onto the back board, in perspective, the stud passes in front (mask) |
| **DÄMMUNG** | insulation | 2.92 | drawn as **hollow outline**: the word is as empty as the wall |
| drin. | inside | 3.56 | quiet, small |
| wirkt die Wand | and the wall works | 4.62 | discreet line |
| wie eine … | like a | 5.42 | discreet line |
| **Trommel.** | drum | 5.82 | hero word drops in (brand light blue), micro punch-in; jumps on each knock |
| — | (knocks, silence) | 6.28 / 6.50 → 7.4 | rings spread in the wall plane, hollow letters vibrate, then everything holds in near silence |

Balance: 4 of 10 units are highlighted (Wand, OHNE, DÄMMUNG, Trommel); the rest stays discreet.

## Integration techniques used
- **Camera tracking:** LK optical flow + RANSAC homography on the stud wall (156 points, ~155 inliers per frame); the text plane is a 2D rectangle mapped into the wall with `matrix3d`.
- **Spatial type and masks:** the text lives on the back board *inside* the cavity; the front stud is a matte from the frozen frame, so letters pass behind it. Word layout leaves the stud in the gap (OH | NE, DÄM | MUNG).
- **Editorial freeze + push-in** (Vox device) on the pause, with a spotlight dim outside the wall.
- **Sound tied to animation:** pencil scratch on the outline, low swell on the push-in, muted thump when «OHNE» lands, tiny ticks as «Trommel» drops, two hollow knocks with rings. Handling noise between words ducked (−10 to −30 dB).

## Review against pre-flight 6g
- **Voice–image, per line:** «No insulation inside» now plays over the empty cavity (the original shows insulation being fitted at this moment). The rolls on the floor are not yet installed: consistent.
- **Technical precision:** «wie eine Trommel» is a figurative comparison (cavity resonance), no performance promise. The overclaim «es wird still» is not used.
- **Visual proof:** every named thing is shown (the new wall, the empty cavity).
- **Limits:** the freeze lasts ~5 s (deliberate, but it is a still); the zoomed source is upscaled 720p and softer; the German question sits partly over the steel frame (readable, not ideal).

## Self-score (before Adriano's verdict, already discounted ~1 point)
Sync precision 4 · integration in the image 4 · balance discreet/highlight 4 · sound–type link 3.5 · finish 3.5.
