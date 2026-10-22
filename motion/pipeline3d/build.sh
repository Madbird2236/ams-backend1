#!/usr/bin/env bash
# AMS 3D pipeline: preview → full render (motion blur) → sound → mux + loudness → QC.
# usage: pipeline3d/build.sh <scene.html> <sfx.py|-> <out_dir> [blur=2]
#   run from motion/. Example:
#   pipeline3d/build.sh pipeline3d/scenes/arch01-schnitt.html pipeline3d/audio/sfx_arch01.py out/arch01 2
set -euo pipefail
SCENE="$1"; SFX="$2"; OUT="$3"; BLUR="${4:-2}"
NAME=$(basename "$SCENE" .html)
export CHROMIUM_PATH="${CHROMIUM_PATH:-/opt/pw-browsers/chromium}"
mkdir -p "$OUT"
echo "[1/5] preview sheet";  node engine/render-html.mjs "$SCENE" --out "$OUT/$NAME.mp4" --preview --cols 6 --w 240
echo "[2/5] render (blur $BLUR)"; node engine/render-html.mjs "$SCENE" --out "$OUT/${NAME}_silent.mp4" --blur "$BLUR"
if [ "$SFX" != "-" ]; then
  echo "[3/5] sound";          python3 "$SFX" "$OUT/${NAME}_sfx.wav"
  echo "[4/5] mux + loudness"; ffmpeg -y -loglevel error -i "$OUT/${NAME}_silent.mp4" -i "$OUT/${NAME}_sfx.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT/${NAME}_mux.mp4"
  engine/loudnorm.sh "$OUT/${NAME}_mux.mp4" "$OUT/$NAME.mp4"
else
  cp "$OUT/${NAME}_silent.mp4" "$OUT/$NAME.mp4"
fi
echo "[5/5] QC";             python3 pipeline3d/qc/qc.py "$OUT/$NAME.mp4" --out "$OUT/${NAME}_qc"
