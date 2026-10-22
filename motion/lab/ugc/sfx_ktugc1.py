# KT-2 audio: two source passages joined, handling noise ducked between words, discreet SFX tied to the animations.
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
src, dst = sys.argv[1], sys.argv[2]
sr, x = wavfile.read(src); x = x.astype(np.float32) / 32768.0
D = 7.4; out = np.zeros((int(D * sr), 2), np.float32)
def put(a, b, at, fade=.02):
    seg = x[int(a*sr):int(b*sr)].copy(); f = int(fade*sr)
    seg[:f] *= np.linspace(0, 1, f)[:, None]; seg[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(at*sr); out[i:i+len(seg)] += seg[:len(out)-i]
put(0.0, 2.45, 0.0); put(4.35, 8.25, 2.45, fade=.06)
def gain(a, b, db, ramp=.05):                                      # duck non-speech gaps (out timeline)
    g = np.ones(len(out)); i, j, r = int(a*sr), int(b*sr), int(ramp*sr); lv = 10**(db/20)
    g[i:j] = lv; g[i-r:i] = np.linspace(1, lv, r); g[j:j+r] = np.linspace(lv, 1, len(g[j:j+r])); out[:] *= g[:, None]
gain(2.27, 2.68, -14); gain(4.26, 4.58, -10); gain(6.16, 7.4, -30, ramp=.12)
rng = np.random.default_rng(3); t = lambda L: np.arange(L) / sr
def add(sig, at, g): i = int(at*sr); n = min(len(sig), len(out)-i); out[i:i+n] += (sig[:n]*g)[:, None]
def bp(sig, lo, hi): return sosfilt(butter(2, [lo, hi], 'band', fs=sr, output='sos'), sig)
# outline draws on «Wand?»: a soft pencil-like scratch
L = int(.5*sr); add(bp(rng.standard_normal(L), 2500, 7000) * np.sin(np.linspace(0, np.pi, L))**2, 1.96, .010)
# push-in: low airy swell
L = int(.85*sr); add(bp(rng.standard_normal(L), 120, 900) * np.sin(np.linspace(0, np.pi, L))**1.5, 2.28, .045)
# «Ohne» lands on the board: muted thump
L = int(.18*sr); tt = t(L); add(np.sin(2*np.pi*70*tt) * np.exp(-tt*28), 2.73, .16)
# «Trommel.» letters drop: tiny ticks
for k in range(8): L = int(.03*sr); add(bp(rng.standard_normal(L), 1800, 5000) * np.exp(-t(L)*160), 5.84 + k*.025, .03)
# two hollow knocks (cavity resonance) + short room tail
def knock(at, g):
    L = int(.6*sr); tt = t(L)
    body = np.sin(2*np.pi*(95 + 40*np.exp(-tt*30))*tt) * np.exp(-tt*7)
    click = bp(rng.standard_normal(L), 300, 2500) * np.exp(-tt*80) * .5
    add(body + click, at, g)
knock(6.28, .30); knock(6.50, .24)
f = int(.25*sr); out[-f:] *= np.linspace(1, 0, f)[:, None]
wavfile.write(dst, sr, (np.clip(out, -1, 1) * 32767).astype(np.int16))
