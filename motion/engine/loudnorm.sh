#!/usr/bin/env bash
# Two-pass EBU R128 loudness normalisation for delivery.
# Target: -14 LUFS integrated (social), true peak <= -1.5 dBTP (safety margin), LRA <= 11.
# Usage: engine/loudnorm.sh in.(wav|mp4) out.(wav|mp4)
set -euo pipefail
IN="$1"; OUT="$2"; I=-14; TP=-1.5; LRA=11
J=$(ffmpeg -hide_banner -nostats -i "$IN" -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
AF="loudnorm=I=$I:TP=$TP:LRA=$LRA:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000"
case "$OUT" in
  *.mp4) ffmpeg -y -loglevel error -i "$IN" -c:v copy -af "$AF" -c:a aac -b:a 192k "$OUT" ;;
  *)     ffmpeg -y -loglevel error -i "$IN" -af "$AF" "$OUT" ;;
esac
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr -s ' ' | tr '\n' ' '; echo
