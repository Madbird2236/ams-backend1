# «Chef, wann?» animatic audio: temp voices (Piper, German) placed on the beats + room tone + SFX that serve the joke.
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly
D, SR = 17.4, 48000
vdir, dst = sys.argv[1], sys.argv[2]
out = np.zeros(int(D*SR), np.float32); rng = np.random.default_rng(11)
bp = lambda x, lo, hi: sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def voice(name, at, g=1.0, whisper=False):
    sr, x = wavfile.read(f"{vdir}/{name}.wav"); x = x.astype(np.float32)/32768
    if x.ndim > 1: x = x.mean(1)
    x = resample_poly(x, SR, sr).astype(np.float32)
    e = np.abs(x); idx = np.where(e > .02)[0]; x = x[max(0, idx[0]-int(.01*SR)):idx[-1]+int(.05*SR)]   # trim Piper padding
    x = bp(x, 160, 7000)                                   # phone mic
    if whisper: x = lp(x, 2500) * .55
    x = x / (np.abs(x).max() + 1e-9) * .7 * g
    i = int(at*SR); out[i:i+len(x)] += x[:len(out)-i]
    return len(x)/SR
def add(sig, at, g): i = int(at*SR); n = min(len(sig), len(out)-i); out[i:i+n] += sig[:n]*g
T = lambda d: np.arange(int(d*SR))/SR
# room tone, jump cuts change its level slightly (phone video)
room = lp(rng.standard_normal(len(out)), 600).astype(np.float32) * .012
lv = np.ones(len(out)); 
for a, b, g in [(2.5, 4.2, 1.2), (4.2, 6.6, .9), (6.6, 8.9, .5), (8.9, 12.4, .8), (12.4, 14.9, 1.0), (14.9, 17.4, 0)]: lv[int(a*SR):int(b*SR)] = g
out += room * lp(lv, 30)
# dialogue on the beats
voice("c1", .25); voice("m1", 1.50); voice("c2", 2.68); voice("m2", 3.58, 1.05); voice("c3", 4.30)
voice("m3", 8.25, .8, whisper=True); voice("m4a", 9.20, .75); voice("m4b", 10.35, .75)
voice("c4", 12.62, .55, whisper=True); voice("m5", 13.22)
# stamp «Noch nicht.»: a dry, soft «tok» under the word (same each time = the gag's signature)
for t in (1.50, 3.58): d = T(.12); add(np.sin(2*np.pi*140*d)*np.exp(-d*45), t, .10)
# B3 finger drumming: 3 rolls of 4 taps
for k in range(3):
    for i in range(4): d = T(.05); add(bp(rng.standard_normal(len(d)), 600, 3000)*np.exp(-d*120), 4.30 + k*.32 + i*.055, .05)
# ladder creak as the finger goes up
d = T(.35); add(bp(np.sin(2*np.pi*(180 + 60*np.sin(d*30))*d) * (1 + .5*rng.standard_normal(len(d))), 300, 1800)*np.sin(np.pi*d/.35), 5.72, .025)
# B4 knuckle tap on dry paint
d = T(.06); add(bp(rng.standard_normal(len(d)), 900, 4000)*np.exp(-d*140), 7.64, .10)
# B5 tape peel, slow ASMR crackle (density follows the pull)
d = T(3.3); env = np.sin(np.pi*d/3.3)**.6
crack = (rng.random(len(d)) < .006).astype(np.float32) * rng.standard_normal(len(d))
peel = bp(rng.standard_normal(len(d))*.25 + crack*3, 1500, 9000) * env
add(peel, 9.0, .05)
# B6 two ladder steps as the Chef goes back up
for t in (13.0, 13.55): d = T(.12); add(lp(rng.standard_normal(len(d)), 400)*np.exp(-d*30), t, .12)
# B7 one soft tone under the signature
d = T(2.2); add((np.sin(2*np.pi*523.25*d) + .35*np.sin(2*np.pi*1046.5*d))*np.exp(-d*1.6)*np.minimum(1, d/.02), 15.45, .06)
f = int(.3*SR); out[-f:] *= np.linspace(1, 0, f)
wavfile.write(dst, SR, (np.clip(np.stack([out, out], 1), -1, 1)*32767).astype(np.int16))
