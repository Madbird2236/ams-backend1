# ARCH-01 sound design (no voice, no music library): every event is derived from the SAME
# timeline as the scene (line position z(t)), so picture and sound cannot drift apart.
#   raw room tone (cold, hollow) → warm room tone behind the line
#   the line: a filtered air sweep whose level follows its speed, passing the camera ≈ peak (L→R pan)
#   light segments: one soft LED relay tick each, at the exact frame they switch on
#   fixtures landing: a short low wooden knock
#   reveal: a warm low chord swell under the claim
# usage: python3 sfx_arch01.py out.wav
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR, D = 48000, 6.0
n = int(D * SR); t = np.arange(n) / SR; rng = np.random.default_rng(7)
bp = lambda x, lo, hi: sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
lp = lambda x, hi: sosfilt(butter(2, hi, 'low', fs=SR, output='sos'), x)

# --- the scene's timeline (keep in sync with scenes/arch01-schnitt.html TL) ---
clamp = lambda x: np.clip(x, 0, 1)
smooth = lambda k: (lambda c: c * c * (3 - 2 * c))(clamp(k))
lineZ = lambda tt: -12.3 + (2.6 + 12.3) * smooth((tt - .6) / 3.8)
def first_t(cond):            # first time a z-condition becomes true (60 Hz search, then refine)
    for tt in np.arange(0, D, 1 / 600):
        if cond(lineZ(tt)): return tt
    return None
camZ = lambda tt: -6.4 + (1.5 + 6.4) * (.45 * clamp(tt / 6) + .55 * (1 - (1 - clamp(tt / 6)) ** 3))   # approx. rail z

z = lineZ(t); speed = np.gradient(z, 1 / SR)
cold = 1 - smooth((t - 3.0) / 1.4)                      # most of what the camera hears is raw until the line passes it
room = bp(rng.standard_normal(n), 70, 320) * (.030 * cold + .012) + bp(rng.standard_normal(n), 900, 2500) * .004 * cold
# line sweep: band-limited air, brightness and level ∝ speed, extra lift when it is near the camera
near = np.exp(-((z - camZ(t)) / 1.6) ** 2)
air = rng.standard_normal(n)
sweep = (bp(air, 300, 1400) * .6 + bp(air, 1400, 6000) * .4 * near) * (speed / speed.max()) * (.35 + .9 * near)
pan = np.clip((z - camZ(t)) / 3, -1, 1)                  # approaching: centre-left; after passing: right
# light segment ticks (z_seg + .8 crossed; 2 strips switch together)
ticks = np.zeros(n)
for k in range(11):
    zc = -11.6 + k * 1.25 + .6
    tt = first_t(lambda zz: zz > zc + .8)
    if tt is None: continue
    i = int(tt * SR); L = int(.03 * SR)
    if i + L < n: ticks[i:i + L] += np.exp(-np.arange(L) / (SR * .004)) * rng.standard_normal(L) * .5
ticks = bp(ticks, 1800, 9000)
# fixtures landing: shelf units (z + 1.0 + 1.3) and tables (z + 1.1 + 1.3); knock when their rise ends
knock = np.zeros(n)
for zf in [-10.3 + 1, -7.7 + 1, -5.1 + 1, -2.5 + 1, -8.6 + 1.1, -5.0 + 1.1]:
    tt = first_t(lambda zz: zz > zf + 1.3 * .72)        # back-ease overshoot peak lands ~72 % into the rise
    if tt is None: continue
    i = int(tt * SR); L = int(.18 * SR)
    if i + L < n:
        e = np.exp(-np.arange(L) / (SR * .035)); f = 95 + 40 * rng.random()
        knock[i:i + L] += np.sin(2 * np.pi * f * np.arange(L) / SR) * e * .5 + bp(rng.standard_normal(L), 300, 1600) * e * .12
# reveal chord (D major 9, low and warm), swelling under the claim
ch = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(73.4, 1), (110, .6), (146.8, .5), (185, .35), (164.8, .25)])
chord = lp(ch, 900) * smooth((t - 4.1) / 1.1) * .045

mono_c = room + knock * .5 + chord + ticks * .18
l = mono_c + sweep * .10 * (1 - .6 * np.clip(pan, 0, 1))
r = mono_c + sweep * .10 * (1 - .6 * np.clip(-pan, 0, 1))
st = np.stack([l, r], 1)
st *= (np.minimum(1, t / .08) * np.minimum(1, (D - t) / .35))[:, None]
st = np.tanh(st * 2.2) / 2.2
wavfile.write(sys.argv[1], SR, (np.clip(st, -1, 1) * 32767).astype(np.int16))
print("events: ticks", int((np.abs(ticks) > .05).sum() > 0), "peak sweep t =", round(float(t[np.argmax(np.abs(sweep))]), 2))
