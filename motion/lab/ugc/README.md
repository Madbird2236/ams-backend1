# UGC lab
Frames are not committed. To re-render KT-UGC-1: extract `reference.mp4` 0–2.6 s as PNG, upscale to 1440×2560 (`kt2fr/0001.jpg…`) plus frame 59 at 4× as `kt2fr/freeze.jpg`, link the folder as `lab/ugc/kt2fr`, then run `node engine/render-html.mjs lab/ugc/ktugc1.html`. Audio: `python3 lab/ugc/sfx_ktugc1.py full.wav mix.wav`, then `engine/loudnorm.sh`.
