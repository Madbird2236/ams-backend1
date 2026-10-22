# MACRO-1 sound: close, quiet, tactile. The wet front «creeps»; a warm room tone; nothing else.
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR, D = 48000, 6.5; n = int(D*SR); t = np.arange(n)/SR; rng = np.random.default_rng(4)
bp = lambda x, lo, hi: sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
fade = np.minimum(1, t/.6) * np.minimum(1, (D - t)/.8)
room = bp(rng.standard_normal(n), 80, 400) * .02
# wet creep: soft sticky micro-crackle, density steady (the edge moves at an even pace)
crack = (rng.random(n) < .0025).astype(float) * rng.standard_normal(n)
creep = bp(rng.standard_normal(n)*.18 + crack*2.2, 1200, 7000) * (.8 + .2*np.sin(2*np.pi*.9*t))
# a low warm drone that opens slowly (light, warmth)
drone = (np.sin(2*np.pi*65.4*t) + .5*np.sin(2*np.pi*98*t) + .25*np.sin(2*np.pi*130.8*t)) * np.minimum(1, t/2.5) * .012
mix = (room + creep*.05 + drone) * fade
st = np.stack([mix*(1 - .15*np.sin(t*.8)), mix*(1 + .15*np.sin(t*.8))], 1); st = np.tanh(st*2)/2
wavfile.write(sys.argv[1], SR, (np.clip(st, -1, 1)*32767).astype(np.int16))
