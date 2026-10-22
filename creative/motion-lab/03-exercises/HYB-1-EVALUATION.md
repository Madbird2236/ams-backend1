# HYB-1 — hybrid composition (14 s, 1080×1920, 0 credits)

**Material:** copies of the Bautools website footage and photo (`ams-os/public/marketing/`). Originals and AMS OS untouched. Demo material only; the video says so on screen («Übung mit Demo-Material · keine AMS-Referenz»).

**Structure:** «Erst der Plan.» (photo in depth) → the photo comes alive → «Dann jeder Schritt.» (tracked ground, 3D bucket) → whip pan → «Feierabend.» (tracked word behind the tracked worker) → recap.

## What each technique really is (no simulation)
| Requirement | How it was done | Evidence / limit |
|---|---|---|
| Motion tracking | **Camera solve on the ground plane**: KLT feature tracking + PnP per frame (OpenCV), replenishing features as the camera moves. «SCHRITT.» is painted on that plane and multiplied, so the workers' real shadows pass over it. **Object tracking**: the van and the worker are tracked by KLT; «Feierabend.» follows the van. | Reprojection error < 1 px over 130 frames. Limits: focal length (900 px), camera height (1.6 m) and horizon are **assumed**, not measured. The van track is 2D (position + scale), not perspective. |
| Parallax | The photo split into 5 depth planes (far plate, text and grid, crane, buildings, foreground with workers). The planes come from a fitted sky colour model, rembg cut-outs of the workers and inpainted plates behind each layer. A pull-out reveal ends exactly on the first video frame (photo → video alignment by ORB, 593/600 inliers), so the photo «comes alive» without a visible cut. | Edges hold for this move; a larger move would show the inpainting. |
| 3D integration | three.js bucket placed in metres on the solved ground. Lighting is taken from the footage: the sun direction is inferred from the real shadows (low, from behind right), with a warm ground bounce. A shadow pass is multiplied onto the concrete, plus a contact shadow. | It stays planted while the camera dollies. Limits: it still looks a little clean (CG); it does not receive the workers' shadows; scale is plausible relative to the people but not measured. |
| Kinetic typography | «Plan.» is drawn like a blueprint **behind the crane** (depth-sorted). «SCHRITT.» appears one letter per footstep **on the ground**. «Feierabend.» stands in the scene **behind the worker** (per-frame person matte), anchored to the van. | «Dann jeder» and the end recap are deliberate screen overlays. |
| Sound design | Pen, grid ticks, thump on «Plan.»; the site comes alive on the photo-to-video moment; footsteps plus a spray per letter; whip; door; warm chord; three recap hits. Normalised to **−14.2 LUFS, −2.4 dBTP**. | The footsteps are on a musical grid, not detected from the walkers' real steps. All sound is synthesised. |

## Self-evaluation (discounted)
| Criterion | Score | Note |
|---|---|---|
| Naturalness of movement | 3.5 | The pull-out and the solved camera feel real; the whip is fast but clean |
| Finish | 3 | The footage is 560 px wide, upscaled ×1.93, so it looks soft; grain and blur on the CG help but do not fully match |
| Contrast / legibility | 4 | Navy on the sky, blue paint on concrete, warm white on haze: all readable |
| Realism of the composition | 3.5 | Ground text and depth-sorted words convince; the bucket is the weakest element |
| Integration (not «pasted on») | 3.5 | 3 of 5 text elements live inside the scene |

## Limits of the source material (identified, not hidden)
- AI-generated footage morphs over time. Clip 1 changes its geometry after ~5 s, so only frames 1–110 were used.
- The van side is narrow, occluded and deforming. A surface track on it would not have been convincing, so I used an object track there and the surface track on the ground.
- Low resolution limits the final finish. Real AMS footage in 4K would raise every score.
