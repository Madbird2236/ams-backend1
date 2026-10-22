# 3D-1 sound: cold empty room → the roller travels (stereo follows the edge) → warmth → one settled chord.
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR, D = 48000, 13.0; n = int(D*SR); L = np.zeros(n, np.float32); Rr = np.zeros(n, np.float32); rng = np.random.default_rng(9)
t = np.arange(n)/SR
bp = lambda x, lo, hi: sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
sm = lambda a, b, x: np.clip((x - a)/(b - a), 0, 1)**2 * (3 - 2*np.clip((x - a)/(b - a), 0, 1))
def stereo(sig, pan, g):  # pan -1..1 (array or scalar)
    pan = np.asarray(pan); l = np.cos((pan + 1)*np.pi/4); r = np.sin((pan + 1)*np.pi/4)
    L[:] += (sig*l*g).astype(np.float32); Rr[:] += (sig*r*g).astype(np.float32)
# cold room + wind behind the window (left), fading as the room warms
cold = 1 - .7*sm(3, 9, t)
stereo(bp(rng.standard_normal(n), 120, 700) * (.7 + .3*np.sin(t*.6)) * cold, -.6, .03)
stereo(lp(rng.standard_normal(n), 300), 0, .006)
# the roller: wet, rhythmic swish while the edge travels (2.6–9.8 s); pan follows it (left wall → back wall → centre)
on = sm(2.5, 2.9, t) * (1 - sm(9.6, 10.0, t))
stroke = .55 + .45*np.sin(2*np.pi*1.9*t)**2
wet = bp(rng.standard_normal(n), 700, 4500) * stroke + .4*bp(rng.standard_normal(n), 3000, 9000)*(rng.random(n) < .02)
pan = np.interp(t, [2.6, 6.6, 9.8, 13], [-.8, -.3, .2, 0])
stereo(wet*on, pan, .05)
# warmth: a slow pad that grows with the light (C – F – G/C)
def pad(freqs, a, b, g):
    env = sm(a, a + 1.2, t) * (1 - sm(b - 1.2, b, t))
    stereo(sum(np.sin(2*np.pi*f*t)/(k + 1)**.6 for k, f in enumerate(freqs)) * env, 0, g)
pad((130.8, 196, 261.6, 329.6), 3.0, 7.4, .018); pad((174.6, 261.6, 349.2, 440), 6.4, 10.4, .02); pad((130.8, 196, 261.6, 329.6, 392), 9.6, 13.0, .024)
# the edge completes: a soft settled bell; the logo: one quiet tone
for at, f, g in ((9.85, 523.25, .05), (10.9, 784, .03)):
    d = np.clip(t - at, 0, None); stereo(np.sin(2*np.pi*f*d)*np.exp(-d*1.8)*(t >= at), 0, g)
mix = np.stack([L, Rr], 1); mix = np.tanh(mix*2)/2
f = int(.4*SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
wavfile.write(sys.argv[1], SR, (np.clip(mix, -1, 1)*32767).astype(np.int16))
