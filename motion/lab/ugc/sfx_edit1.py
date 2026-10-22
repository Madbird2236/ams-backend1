# Sound design for UGC re-edit 1 (local, free): hollow knocks on «drum», room falls silent after «quiet».
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
src, dst = sys.argv[1], sys.argv[2]
sr, x = wavfile.read(src); x = x.astype(np.float32) / 32768.0
n = len(x); t = np.arange(n) / sr
rng = np.random.default_rng(7)
def knock(at, gain):
    L = int(.35 * sr); tt = np.arange(L) / sr
    body = np.sin(2*np.pi*(95 + 40*np.exp(-tt*30))*tt) * np.exp(-tt*9)          # hollow cavity resonance
    click = sosfilt(butter(2, [300, 2500], 'band', fs=sr, output='sos'), rng.standard_normal(L)) * np.exp(-tt*80) * .5
    s = (body + click) * gain; i = int(at * sr); e = min(n, i + L)
    x[i:e] += s[:e-i, None] * .9
knock(9.80, .28); knock(10.00, .22)
# «es wird still»: from 14.10 low-pass sweep + fade to true silence by 15.0
a, b = int(14.10*sr), n
seg = x[a:b].copy(); low = sosfilt(butter(2, 900, 'low', fs=sr, output='sos'), seg, axis=0)
mix = np.linspace(0, 1, b-a)[:, None]
fade = (np.cos(np.linspace(0, np.pi, b-a)) * .5 + .5)[:, None] ** 1.5
x[a:b] = (seg*(1-mix) + low*mix) * fade
x[int(14.85*sr):] = 0
wavfile.write(dst, sr, (np.clip(x, -1, 1) * 32767).astype(np.int16))
