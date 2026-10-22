# 3D-1 «Grau war gestern.» (0 credits)

**File:** `AMS_3D-1_grau-war-gestern.mp4`, 13.0 s, 9:16, −13.7 LUFS, peak −2.5 dBFS. Source: `motion/lab/3d1.html` (three.js, real-time render in headless Chromium, ≈ 4 min), `motion/lab/sfx_3d1.py`.
**Route:** 3D (no filming, no AI): the idea (paint travelling through an empty room, letters as unpainted negative space) is a controlled transformation that would be expensive to shoot and hard to control with AI.

## Story
| Time | Beat | Technique |
|---|---|---|
| 0–2.6 | **Beginning:** a raw grey room, cold light through the window, a paint bucket in the foreground | concrete material, sky through the window, cool sun + sky fill, foreground object for depth |
| 2.6–6.6 | **Transformation:** a crisp paint edge travels along the window wall; the camera follows it | one shader for all walls: edge position on the unwrapped room, fresh paint slightly darker and glossier near the edge, roller stipple |
| 6.6–9.8 | The edge turns the corner and crosses the accent wall; the letters stay grey | type as **negative space** (masked letters, like taped stencils), in the wall's own material and light |
| 3–10 | Light warms, the sun climbs, the window light slides down the wall | colour temperature shift, sun moves, shadow of the frame and mullions crosses the slogan |
| 9.8–13 | **Reveal:** frontal, the slogan clean above the window light; logo (mono light on the dark wall) | composition, brand layer applied in 2D |
Sound: cold wind (left) → wet roller swish whose stereo position follows the edge → a pad that warms with the light → one settled bell when the edge completes.

## Technically demonstrated
- **Lighting:** directional sun with soft PCF shadows through a modelled window, hemisphere fill, colour temperature and position animated with the story, filmic tone mapping and exposure ramp.
- **Materials:** procedural concrete (pores, mottling, cracks), wood floor, matte paint with a wet-edge gloss/darkening, aluminium/plastic props.
- **Shadows:** window frame and mullions projected onto the wall and across the letters; object shadows on the floor.
- **Typography in 3D space:** the slogan lives *in* the wall (material, light and shadow act on it); it is revealed by the story's own mechanism, not added on top.
- **Camera:** five keyframes, a follow move that tracks the edge, breathing micro-motion (no locked-off frame).
- **Technical lesson:** three.js shares a shader program across materials with the same `onBeforeCompile` source; each wall needs its own `customProgramCacheKey`. Texture repeat also transforms `vUv`: masks need the raw `uv`.

## Still to improve
- **The transformation lacks a hero close-up.** The edge is crisp but small in frame; the wet edge is barely visible. A macro on the edge passing (as in «Chef, wann?») would give the transformation its moment.
- **Weak frame around 2 s:** mid-pan, mostly flat grey wall. Tighter camera path or a cut.
- **Light realism:** no global illumination (no real bounce from the warm floor), no volumetric beam; the window patch is clean but «CG». Dust is barely visible.
- **Materials:** concrete reads as grey plaster at a distance; normal/roughness maps would add relief. Wood planks repeat.
- **Unused prop:** the ladder is modelled but never in frame.
- **Grey letters on teal ≈ 3:1 contrast:** acceptable for very large type, but the grey could be lighter for phones.

## Self-score (calibrated)
Idea and story 4 · lighting 3.5 · materials 3 · shadows 4 · camera 3.5 · type integration 4.5 · finish 3.
