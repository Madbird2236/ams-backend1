# «Erfolg wird gebaut» — sound: voice (edited) + original music + SFX, all from the same word timeline as the picture.
import json, subprocess, numpy as np
SR = 48000; D = 50.0; n = int(D * SR); T = np.arange(n) / SR; rng = np.random.default_rng(3)
W = json.load(open("words_final.json"))
VO, P1, P2, PAD = 0.35, 28.70, 41.60, 0.6
sh = lambda x: x + VO + (PAD if x >= P1 else 0) + (PAD if x >= P2 else 0)
w = lambda i: sh(W[i][0])
def load(p):
    a = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(a, np.float32).copy()
# ---- voice: split at the two pauses (in the edited timeline) and place with the picture's offsets
v = load("voice_final.wav"); voice = np.zeros(n)
cuts = [(0.0, 28.55, VO), (28.55, 41.50, VO + PAD), (41.50, len(v) / SR, VO + 2 * PAD)]
for a, b, off in cuts:
    seg = v[int(a * SR):int(b * SR)]; i = int((a + off) * SR); m = min(len(seg), n - i); voice[i:i + m] += seg[:m]
voice /= np.abs(voice).max() + 1e-9; voice *= .70
# ---- helpers
def env(L, a, d): t = np.arange(L) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def lp(x, k):
    y = np.empty_like(x); acc = 0.
    for i, s in enumerate(x): acc += k * (s - acc); y[i] = acc
    return y
from scipy.signal import butter, sosfilt
bp = lambda x, lo, hi: sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
lowp = lambda x, hi: sosfilt(butter(2, hi, 'low', fs=SR, output='sos'), x)
def add(buf, t0, sig, g=1.0):
    i = int(t0 * SR); m = min(len(sig), n - i)
    if i >= 0 and m > 0: buf[i:i + m] += sig[:m] * g
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
# ---- music: 96 BPM, Am–F–C–G, pad + sub pulse + soft hats; arrangement follows the story
BPM = 96; beat = 60 / BPM; music = np.zeros(n)
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
bar = 4 * beat
def section_gain(t):
    g = .55 + .45 * np.clip((t - 4) / 20, 0, 1)                # builds slowly
    g = np.where((t > w(67) - .05) & (t < w(68) - .05), .0, g)  # silence on «scheitern?»
    g = np.where(t > w(72), g * (1 + .25 * np.clip((t - w(72)) / 10, 0, 1)), g)
    g = np.where(t > D - 2.2, g * np.clip((D - t) / 2.2, 0, 1) ** .7, g)
    return g
for k in range(int(D / bar) + 1):
    t0 = k * bar; ch = chords[k % 4]; L = int(bar * SR) + SR // 2
    tt = np.arange(L) / SR; e = np.minimum(1, tt / .35) * np.exp(-np.maximum(0, tt - bar) / .4)
    pad = sum(np.sin(2 * np.pi * hz(m) * tt + .3 * np.sin(2 * np.pi * .5 * tt)) + .4 * np.sin(2 * np.pi * hz(m + 12) * tt * 1.003) for m in ch)
    add(music, t0, lowp(pad * e, 2200) * .05)
    add(music, t0, np.sin(2 * np.pi * hz(ch[0] - 24) * tt) * e * .10)               # bass
for b in range(int(D / beat)):
    t0 = b * beat
    kick = np.sin(2 * np.pi * (48 + 70 * np.exp(-np.arange(int(.25 * SR)) / SR / .03)) * np.arange(int(.25 * SR)) / SR) * env(int(.25 * SR), .002, .09)
    if t0 > 4.0: add(music, t0, kick, .30 if b % 2 == 0 else .18)
    if t0 > 12.0: add(music, t0 + beat / 2, bp(rng.standard_normal(int(.05 * SR)), 6000, 12000) * env(int(.05 * SR), .001, .012), .05)
    if t0 > w(72): add(music, t0 + beat / 4, np.sin(2 * np.pi * hz(chords[int(t0 / bar) % 4][b % 3] + 12) * np.arange(int(.18 * SR)) / SR) * env(int(.18 * SR), .003, .07), .045)
music *= section_gain(T)
# final chord on «gebaut»
L = int(4.5 * SR); tt = np.arange(L) / SR
add(music, w(99), sum(np.sin(2 * np.pi * hz(m) * tt) for m in [45, 57, 60, 64, 69]) * np.minimum(1, tt / .02) * np.exp(-tt / 1.6) * .06)
# ---- SFX
sfx = np.zeros(n)
def whoosh(t0, d=.45, g=.35, lo=300, hi=3000):
    L = int(d * SR); x = bp(rng.standard_normal(L), lo, hi) * np.sin(np.pi * np.arange(L) / L) ** 2; add(sfx, t0 - d * .5, x, g)
def tick(t0, g=.25, f=2400):
    L = int(.04 * SR); add(sfx, t0, np.sin(2 * np.pi * f * np.arange(L) / SR) * env(L, .001, .008), g)
def thud(t0, g=.6, f=70):
    L = int(.4 * SR); tt = np.arange(L) / SR; add(sfx, t0, np.sin(2 * np.pi * f * tt * (1 - .3 * tt)) * env(L, .002, .12) + bp(rng.standard_normal(L), 200, 1200) * env(L, .001, .03) * .3, g)
def beep(t0, g=.18): L = int(.12 * SR); add(sfx, t0, np.sin(2 * np.pi * 988 * np.arange(L) / SR) * env(L, .003, .06), g)
for t0 in [w(8) - .1, w(12) - .05, w(18) - .1, w(21) - .1, w(27) - .1, w(33) - .05, w(49) - .15, w(54) - .2, w(58) - .15, w(72) - .2, w(91) - .1]: whoosh(t0)
for i in [7, 15, 18, 22, 26, 28, 35, 43, 52, 83, 88, 89, 90]: tick(w(i), .16)
tick(w(32) + .05, .3, 3200)                 # «+ mehr» passes the promise
whoosh(w(41) + .3, .9, .45, 120, 900); thud(w(41) + 1.0, .5)     # costs fall away
beep(w(46) + .05); beep(w(48) + .05)        # heartbeat
thud(w(57), .45, 110)                       # wrong turn: wall
we = lambda i: sh(W[i][1])
thud(we(67) + .03, .8, 55); thud(we(71) + .03, .6, 60)              # the falls land after the words, never on them
tick(w(64) + .05, .3, 1800)                 # «jetzt»
for c in range(6): tick(w(33) + .05 + c * .27 + .33, .22, 1500 + 120 * c)   # coins land on the stack
L = int(.5 * SR); add(sfx, w(93), bp(rng.standard_normal(L), 1500, 6000) * (rng.random(L) < .004) * 8, .25)   # die rattle
t0 = w(95) - .1
for k in range(63): tick(t0 + (k / 63) ** 1.1 * (D - 3.2 - t0), .07, 3000 + 40 * (k % 7))   # days being built
# ---- ducking: music sits under the voice
ve = np.convolve(np.abs(voice), np.ones(int(.05 * SR)) / int(.05 * SR), mode="same")
duck = 1 - .55 * np.clip(ve / .08, 0, 1)
duck = np.convolve(duck, np.ones(int(.12 * SR)) / int(.12 * SR), mode="same")
mixd = voice + music * duck * .9 + sfx * .55
mixd = np.tanh(mixd * 1.1) / 1.1
st = np.stack([mixd, mixd], 1)
import wave
with wave.open("mix.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("mix ok", round(len(mixd) / SR, 2), "voice peak", round(float(np.abs(voice).max()), 2))
