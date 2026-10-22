# VOX-2 sound: paper and pen as glue (Vox language), winter wind outside, quiet room. Every sound sits on an appearance.
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR, D = 48000, 17.4; out = np.zeros(int(D*SR), np.float32); rng = np.random.default_rng(5)
bp = lambda x, lo, hi: sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
T = lambda d: np.arange(int(d*SR))/SR
def add(sig, at, g): i = int(at*SR); n = min(len(sig), len(out)-i); out[i:i+n] += sig[:n]*g
def paper(at, g=.08): d = T(.18); add(bp(rng.standard_normal(len(d)), 900, 6000)*np.sin(np.pi*d/.18)**2, at, g)
def tick(at, g=.10): d = T(.04); add(bp(rng.standard_normal(len(d)), 1500, 7000)*np.exp(-d*150), at, g)
def pen(at, dur, g=.04): d = T(dur); add(bp(rng.standard_normal(len(d)), 2500, 8000)*(.6 + .4*np.sin(d*55))*np.minimum(1, d/.05)*np.minimum(1, (dur-d)/.05), at, g)
# winter wind outside (low, filtered), dips when we are inside the chart
wind = bp(rng.standard_normal(len(out)), 150, 900) * (.6 + .4*np.sin(np.arange(len(out))/SR*.7))
lv = np.ones(len(out)); lv[int(8.9*SR):int(12.6*SR)] = .3; lv[int(14.4*SR):] = .25
out += (wind * sosfilt(butter(1, 2, 'low', fs=SR, output='sos'), lv) * .02).astype(np.float32)
for t in (0.0, 2.3, 5.1, 8.6, 12.9, 14.6): paper(t, .07)        # each new headline line slides in like paper
for t in (2.5, 3.1, 6.0, 12.9): tick(t, .09)                     # tags
pen(9.0, 1.2); tick(10.2, .08); tick(10.3, .06); tick(10.9, .1)   # the curve draws, threshold, dot
for i in range(26): tick(13.0 + i*.03, .02)                       # mould spreads: tiny dry ticks
d = T(2.4); add((np.sin(2*np.pi*392*d) + .3*np.sin(2*np.pi*784*d))*np.exp(-d*1.4)*np.minimum(1, d/.02), 14.7, .05)
# light music bed (Vox language): soft sine pad, four chords, slow attack
def chord(freqs, at, dur, g):
    d = T(dur); env = np.minimum(1, d/.6) * np.minimum(1, (dur-d)/.8)
    add(sum(np.sin(2*np.pi*f*d) * (1/(k+1)**.5) for k, f in enumerate(freqs)) * env, at, g)
for i, ch in enumerate([(220, 261.6, 329.6), (174.6, 220, 261.6), (261.6, 329.6, 392), (196, 246.9, 293.7)]):
    chord(ch, i*4.3, 4.9, .022)
# tame transients before loudness normalisation (soft limiter)
out[:] = np.tanh(out * 2.2) / 2.2
f = int(.3*SR); out[-f:] *= np.linspace(1, 0, f)
wavfile.write(sys.argv[1], SR, (np.clip(np.stack([out, out], 1), -1, 1)*32767).astype(np.int16))
