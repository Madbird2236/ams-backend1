# «Chef, wann?» animatic v2 audio (no closing line; silence carries the climax): temp voices (Piper, German) placed on the beats + room tone + SFX that serve the joke.
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly
D, SR = 18.6, 48000
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
for a, b, g in [(2.6, 4.3, 1.2), (4.3, 5.65, .9), (5.65, 7.0, .7), (7.0, 8.9, .5), (8.9, 13.5, .8), (13.5, 15.8, .3), (15.8, 18.6, 0)]: lv[int(a*SR):int(b*SR)] = g
out += room * lp(lv, 30)
# dialogue on the beats
voice("c1", .25); voice("m1", 1.55); voice("c2", 2.75); voice("m2", 3.65, 1.05); voice("c3", 4.40)
voice("m3", 8.15, .8, whisper=True); voice("m4a", 9.10, .75); voice("m4b", 10.30, .75)
# stamp «Noch nicht.»: the gag's dry signature
for t in (1.55, 3.65): d = T(.12); add(np.sin(2*np.pi*140*d)*np.exp(-d*45), t, .10)
# corner lift (eager) and press back
for t, g in ((.30, .03), (1.62, .04)): d = T(.08); add(bp(rng.standard_normal(len(d)), 1200, 6000)*np.exp(-d*60), t, g)
# drumming fingers (same times as the animation)
for k in range(6):
    for i in range(4): d = T(.05); add(bp(rng.standard_normal(len(d)), 600, 3000)*np.exp(-d*120), 2.70 + (0 if k < 3 else 1.75) + (k % 3)*.3 + i*.055, .05)
# the finger goes up: a small ladder creak, then nothing
d = T(.35); add(bp(np.sin(2*np.pi*(180 + 60*np.sin(d*30))*d) * (1 + .5*rng.standard_normal(len(d))), 300, 1800)*np.sin(np.pi*d/.35), 5.90, .025)
# knuckle on dry paint
d = T(.06); add(bp(rng.standard_normal(len(d)), 900, 4000)*np.exp(-d*140), 7.56, .10)
# the pull: slow, even crackle for 4.6 s
d = T(4.6); env = np.minimum(1, d/.3) * np.minimum(1, (4.6 - d)/.15)
crack = (rng.random(len(d)) < .006).astype(np.float32) * rng.standard_normal(len(d))
add(bp(rng.standard_normal(len(d))*.25 + crack*3, 1500, 9000) * env, 8.90, .05)
# the last centimetre: a short quick release
d = T(.3); add(bp(rng.standard_normal(len(d))*.4 + (rng.random(len(d)) < .03)*rng.standard_normal(len(d))*3, 1500, 9000)*np.exp(-d*9), 13.50, .07)
# climax: near silence (room tone drops), then one soft tone under the signature
d = T(2.2); add((np.sin(2*np.pi*523.25*d) + .35*np.sin(2*np.pi*1046.5*d))*np.exp(-d*1.6)*np.minimum(1, d/.02), 16.25, .06)
f = int(.3*SR); out[-f:] *= np.linspace(1, 0, f)
wavfile.write(dst, SR, (np.clip(np.stack([out, out], 1), -1, 1)*32767).astype(np.int16))
