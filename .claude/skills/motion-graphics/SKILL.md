---
name: motion-graphics
description: Produce branded motion graphics videos (MP4) for AMS from a JSON storyboard — social reels (9:16), LinkedIn/web (16:9, 1:1, 4:5), project before/after, stats, service lists, testimonials, logo outros. Use when asked for an animated video, reel, motion graphic, explainer, showreel or animated social post.
---

# Motion Graphics Engine

Deterministic HTML + GSAP compositions rendered frame-by-frame with headless Chromium and ffmpeg. Every frame is rendered, so output never drops frames regardless of machine speed.

## Location
- `motion/engine/player.html` — scene library + timeline builder
- `motion/engine/render.mjs` — renderer (Playwright → ffmpeg → MP4)
- `motion/brand/ams.json` — brand tokens (colors, font, logo text). **Placeholders — replace with the official AMS brand guide.**
- `motion/specs/*.json` — storyboards. `ams-showreel.json` is the reference example.
- `motion/out/` — renders (git-ignored)

## Workflow
1. `cd motion && npm install` (first time per machine/session).
2. Write or copy a storyboard in `motion/specs/`.
3. Preview first (seconds, not minutes): `node engine/render.mjs specs/<name>.json --preview` → contact sheet PNG. Look at it before rendering.
4. Render: `node engine/render.mjs specs/<name>.json [--format 9:16|16:9|1:1|4:5] [--out out/x.mp4]`.
5. Same storyboard → all formats: run once per `--format`. Layout scales off the short side automatically.

## Storyboard format
```json
{ "format": "16:9", "fps": 30, "brand": "../brand/ams.json", "transition": 0.5,
  "audio": "../assets/music.mp3", "progressBar": true,
  "scenes": [ { "type": "title", "duration": 4, ... } ] }
```
Scene types:
| type | fields |
|---|---|
| `title` | `kicker`, `title` (use `\n` for line breaks), `subtitle` |
| `stats` | `title`, `items[]: {value, prefix?, suffix?, label}` — animated counters, Swiss `'` thousands separator |
| `list` | `title`, `items[]` (strings) |
| `beforeAfter` | `before`, `after` (image paths relative to the spec), `beforeLabel`, `afterLabel`, `caption` — wipe reveal |
| `quote` | `text`, `author` |
| `outro` | `logo?`, `cta`, `contact` |

`duration` is seconds per scene (default: animation length + 1.2s). Scenes crossfade by `transition` seconds.

## Adding a scene type
Add a builder to `BUILDERS` in `player.html` returning `{el, tl}` (a scene element and a GSAP timeline starting at 0). Use `calc(var(--u)*N)` sizes so it works in every format. Never use wall-clock timers, CSS animations or `Math.random()` — only GSAP tweens, so seeking is deterministic.

## Quality rules
- Never ship placeholder stats, testimonials or contact details. The example spec is marked as placeholder; real numbers must come from the user.
- Use real project photos for `beforeAfter` with client permission; without images it shows neutral gradients.
- Preview → fix → render. Do not render full MP4 to check layout.
- Keep reels 15–30s; first 2s must carry the message.

## Julia
`scripts/setup-julia.sh` installs Julia from conda-forge (the official julialang.org hosts may be blocked by the cloud network policy). Julia packages need `pkg.julialang.org` allowed in the environment's network settings.
