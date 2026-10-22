# MACRO-1 «Die Kante» — macro study of a paint edge (0 credits)

**File:** `AMS_MACRO-1_kante.mp4`, 6.5 s, 9:16, −14.8 LUFS, peak −2.2 dBFS. Comparison: `MACRO-1-vs-3D-1.jpg` (top: 3D-1 transformation, bottom: this study).
**Source:** `motion/lab/macro1.html` (three.js, own depth-of-field pass), `motion/lab/sfx_macro1.py`. Render ≈ 6.5 min.

## Direction (one idea)
Light meeting two surfaces, and the sharp line between them. Nothing else: no text, no logo, no props.
- **Camera:** low, close, looking up *along* the wall. The wall recedes into soft focus; the edge becomes a line running into depth. The camera drifts slower than the edge, so the edge **crosses the frame** (left third → right third) instead of being pinned to the centre.
- **Light:** one warm raking key from the painted side, almost parallel to the wall, plus a cool soft fill. Raking light reveals the old relief; on the fresh paint it becomes a sheen.
- **Sound:** close and quiet: warm room tone, a slow drone, the soft sticky creep of wet paint. No music cue, no whoosh.

## What the study shows
| Asked for | How |
|---|---|
| Light interacting with paint | Wet front glossy (roughness 0.09) and darker; dries to satin behind (0.55); the raking key catches the sheen |
| Old vs new surface | Old: off-white plaster with pores, dirt in the pits, a hairline crack, relief from a procedural height map. New: paint fills ~85 % of the relief and covers the crack as it passes |
| Sharpness of the edge | The edge follows the relief by half a millimetre (not a CG-straight line) and carries a thin raised lip that catches the light |
| Depth | Real depth of field from the depth buffer: sharp at the edge, soft into the distance; the wall's horizon reads as the room out of focus |

## Compared with the 3D-1 transformation
| | 3D-1 (room) | MACRO-1 |
|---|---|---|
| Where the eye goes | Mostly grey walls, the change is small in frame | The change *is* the frame |
| Edge | Correct but distant, no material detail | Lip, relief, wet front visible |
| Light on paint | Flat colour, uniform | Sheen gradient wet → dry |
| Depth | Linear room perspective, everything sharp | Depth of field, perspective into soft focus |
| Camera | Functional pan that explains the space | One coordinated move that serves one moment |
Lesson: 3D-1 built a working scene; MACRO-1 directs a moment. The first answers «what happens», the second makes you *watch* it happen.

## Still to improve
- **Paint colour reads slightly cyan and flat** in the middle of the frame: needs subtle roller texture and a less uniform tone.
- **The wet front** could show more: a brief specular glint travelling with the edge would sell «fresh» instantly.
- **No self-shadowing in the relief** (normal map only); real macro shows tiny shadows in the pits.
- **The wall's horizon** (top left) is a soft wedge of room colour; a real lens would show a blurred room there.
- 6.5 min render for 6.5 s: fine for tests, slow for many iterations.

## Self-score (calibrated)
Light 4 · material contrast old/new 4 · edge 4.5 · depth 4 · camera 4 · sound 3.5 · overall cinematic finish 4 (3D-1: 3).
