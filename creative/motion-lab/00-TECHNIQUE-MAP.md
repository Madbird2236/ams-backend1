# Motion lab — technique map, tools and real limits (phase 2, 2026-10-22)

Purpose: before any production, know what Julia can really execute, what needs building, and what needs tools or assets from outside. Every status below comes from a test run in this environment on 2026-10-22, not from assumptions.

**Rule for the whole lab:** a technique is used only when it adds clarity, emotion, humour, rhythm or meaning. A move that only decorates is cut.

## 1. Environment audit (tested)
| Capability | Result of the test | Consequence |
|---|---|---|
| Frame-exact renderer (HTML + GSAP → Chromium → ffmpeg) | Works; 15 s 1080×1350 in ~30 s (Maestro) | Base for 2D / 2.5D / typography / Vox work |
| GSAP plugins | MorphSVG, DrawSVG, SplitText, MotionPath, CustomEase, Physics2D, Flip present (GSAP 3.13) | Morphing, line drawing, per-letter type, paths, custom easing, particles |
| CSS 3D (perspective, translateZ, rotateY), blend modes, backdrop blur | Supported | Real 2.5D parallax and layered depth without WebGL |
| WebGL 2 / three.js | Works via **software** GPU (SwiftShader). Lit 3D scene with shadows: 60 frames in 13.6 s (≈0.23 s/frame) | 3D is feasible for simple scenes; complex scenes (many lights, reflections, high poly) will be slow |
| Maps of Switzerland | npm `swiss-maps` (cantons/municipalities, BSD; data © swisstopo, attribution) + d3-geo | Vox-style maps of Switzerland are possible locally |
| Icons | Phosphor (MIT), Lucide (ISC) via npm | Clean animated pictograms, free for ads |
| Emojis | Noto Color Emoji installed (OFL). Twemoji graphics need attribution (CC-BY). OpenMoji is CC-BY-SA, **avoid in ads** | Use Noto, or redraw as AMS-style icons |
| Lottie | lottie-web (MIT) can play Lottie files frame-exactly | Usable for icon animations; licence of each Lottie file must be checked |
| Photo cut-outs (Vox collage) | rembg models reachable on GitHub; rembg and opencv installable from PyPI | Background removal for collages: to install and test |
| Motion blur | Not native; ffmpeg `tmix`/`minterpolate` available | Build supersampling (render 4× frames, blend) for crash zooms and whip pans |
| Video footage inside the engine | Chromium `<video>` seeking is not frame-exact | Build an image-sequence layer (ffmpeg extracts frames, engine shows frame n) |
| Voice | Piper TTS local, German «Thorsten» (CC0), 16 kHz, German not Swiss | Timing and drafts only; Swiss voice comes from Adriano's Voice Studio |
| Word-level VO sync | Piper gives no word timestamps; Whisper models sit on blocked hosts | Workaround: synthesise word by word, or place words by phrase timing; true forced alignment is 🔴 |
| Sound effects | Synthesis only (numpy); no sample library reachable/licensed yet | 🔴 for realistic SFX (tools, rooms, paper) |
| Blender / heavy 3D | Not installed | 🔴 for photoreal 3D; three.js covers stylised 3D |
| AMS photos / approved stills / real footage | The Higgsfield image host is blocked from this environment; no real project photos here | 🔴 for hybrid and documentary work until files are placed in the repo |

Legend: ✅ can do now · 🟡 possible, needs building or practice · 🔴 needs an outside tool, licence or asset.

## 2. Technique map
### 2.1 Kinetic typography
| Technique | Why it works | How we build it | Status | Use at AMS |
|---|---|---|---|---|
| Word-by-word reveal on the beat or the voice | The eye reads at the pace of the ear; meaning lands with the sound | Masked spans + GSAP on a beat grid (done in Maestro) | ✅ | VO lines, slogans |
| Scale hierarchy (key word big, rest small) | Shows the one word that matters | SplitText + per-word scale and weight | ✅ | «Schimmel?», «Filiale für Filiale» |
| Tracking / weight as emotion (shiver, tighten, stretch) | Type behaves like the meaning | SplitText chars + letter-spacing/skew tweens; variable fonts for weight | 🟡 (variable fonts to install) | «kalte Füsse» letters shiver; «genau» snaps tight |
| Word becomes an object (and back) | Fuses message and image; memorable | Text → SVG outlines → MorphSVG to a shape | 🟡 (outline-text pipeline) | «Kante» → painted edge |
| Text integrated in the scene (on walls, in perspective) | Feels designed, not overlaid | CSS 3D / three.js text planes with matching perspective | 🟡 | Headlines painted on the store wall |
| Masks and reveals by objects | The object «writes» the text | Clip paths driven by an animated object (tape, roller, light) | ✅ (tape study) | Tape peel, roller stroke, light sweep |
| Sync with the voice | Credibility and rhythm | Phrase timing ✅; word timing 🔴 (no aligner) | 🟡 | All narrated pieces |

### 2.2 Camera moves (virtual)
| Technique | Why it works | How | Status | Use |
|---|---|---|---|---|
| Push-in / pull-out | Attention / context; slow = emotion, fast = urgency | Scale + translate on a camera group | ✅ | Reveal of a detail; reveal of a whole store |
| Parallax 2.5D (multi-plane) | Depth from flat layers; premium feel from stills | CSS 3D layers at different Z, camera moves the stage | 🟡 (needs cut-out layers) | Animate approved photos without AI video |
| Crash zoom | Comic or shock emphasis | Very fast scale on an expo ease + motion blur | 🟡 (motion blur) | Humour beats («Perfekt.» in the mould villain) |
| Whip pan | Energy, change of place or time | Fast horizontal move + directional blur, cut hidden in the blur | 🟡 (motion blur) | City to city in the five-cities story |
| Speed ramp | Drama inside one move (slow → fast → slow) | Time-remap the timeline with a custom ease | 🟡 (helper) | The tape pull, the door opening |
| Dolly zoom (vertigo) | Inner tension: the world shifts around a fixed subject | three.js: move camera back while narrowing the FOV | 🟡 (3D, slow but feasible) | Expansion manager's doubt before opening |
| 3D orbit / fly-through | Spatial understanding | three.js camera paths | 🟡 | Store layout, rollout plan |

### 2.3 Icons, emojis, symbols, infographics
| Technique | Why | How | Status | Use |
|---|---|---|---|---|
| Animated pictograms | Fast, language-free meaning | Phosphor/Lucide SVG + DrawSVG/morph | 🟡 (install) | Process: Begehung → Offerte → Ausführung → Übergabe |
| Expressive emoji | Social-native tone, humour | Noto emoji as elements with squash/stretch | ✅ | B2C humour only, never B2B proof |
| Arrows, circles, highlights | Direct the eye to evidence | DrawSVG on hand-drawn paths | ✅ | Point at mould, at a detail, at a dimension |
| Counters and indicators | Numbers feel real when they move | GSAP counter (exists in engine) | ✅ | Only real, approved numbers |
| Dynamic charts | Explain a relationship (e.g. temperature vs humidity) | SVG/d3 bars, lines, areas drawn on | 🟡 (d3 install) | Why mould grows in winter (education) |

### 2.4 Vox-style editorial explainer
Study in `01-VOX-STUDY.md`. Status: map ✅ after install · collage 🟡 (cut-outs) · document/evidence 🟡 · paper texture ✅ · highlight ✅ · documentary photos 🔴 (assets).

### 2.5 Motion graphics 2D / 2.5D / 3D
| Technique | Status | Note |
|---|---|---|
| Shape morphing, line drawing, masks | ✅ | Proven in Maestro |
| Particles (dust, snow, condensation drops) | 🟡 | Physics2D / seeded custom particles; must stay deterministic |
| Layered composition with depth of field | 🟡 | Blur per layer by Z |
| Lighting in 2D (light sweeps, glows, shadows) | ✅ | SVG filters, gradients |
| 3D objects and lighting | 🟡 | three.js works (software GPU); stylised, not photoreal |

### 2.6 Cinematic motion design
| Technique | Status | Note |
|---|---|---|
| Match cut by shape / by movement | ✅ | Study 1 (baton → stand) |
| Meaning transitions (object changes role) | ✅ | Staves → light lines |
| Spatial continuity across cuts | 🟡 | Needs camera-aware layouts |
| Dramatic lighting | 🟡 | 2D good; 3D limited by software GPU |
| Edit rhythm and sound sync | ✅ | Shared beat grid |
| Realistic sound design | 🔴 | Needs sample library or recordings |

### 2.7 Hybrid languages
| Combination | Status | What is missing |
|---|---|---|
| Graphics + typography + synthetic sound | ✅ | — |
| Photo + graphics (collage, annotation, parallax) | 🟡 / 🔴 | Real photos in the repo; cut-out tool install |
| Footage + graphics | 🔴 | Footage files + image-sequence layer |
| Narration (Swiss) + motion | 🔴 | Voice Studio files from Adriano |

## 3. Real limits, stated plainly
1. **No real images here.** The approved stills sit on a blocked host and there are no AMS project photos in the repo. Hybrid, Vox collage and documentary work need Adriano to add files (photos, footage, permissions).
2. **Software 3D.** three.js works but slowly; keep 3D stylised and short.
3. **No Swiss voice, no SFX library, no word aligner.** Timing work is possible; final sound is not.
4. **One reviewer.** All quality judgements still come from Adriano; market response remains untested.

## 4. Build list before the exercises (zero cost, local)
1. Engine helper: motion blur by supersampling (`--blur 4`).
2. Engine helper: image-sequence layer for photos/footage.
3. Engine helper: speed-ramp / time-remap.
4. Packages: d3 + swiss-maps, Phosphor icons, variable fonts (Inter Tight / Inter variable via fontsource).
5. Cut-out pipeline (rembg + opencv), tested on a neutral image.
6. Script checker: total duration including the end card, reading time per text, words per second of VO.
