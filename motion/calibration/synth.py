"""Tiny deterministic synth for animatic sound design (numpy only, no samples, no licences).
Usage: python3 synth.py <piece> <out.wav>   piece = maestro | t1 | t2 | t3"""
import sys, wave, numpy as np
SR = 48000
rng = np.random.default_rng(7)

def buf(sec): return np.zeros((int(SR * sec), 2))
def t_(d): return np.arange(int(SR * d)) / SR
def env(d, a=0.005, decay=0.3):
    t = t_(d); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / decay); return e
def add(b, at, sig, gain=1.0, pan=0.0):
    i = int(at * SR); n = min(len(sig), len(b) - i)
    if n <= 0: return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    b[i:i + n, 0] += sig[:n] * gain * l * 1.41; b[i:i + n, 1] += sig[:n] * gain * r * 1.41
def lp(x, k):  # one-pole low-pass, k in (0,1]
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += k * (v - acc); y[i] = acc
    return y
def hp(x, k): return x - lp(x, k)
def noise(d): return rng.standard_normal(int(SR * d))
def hz(note):  # 'A3' -> Hz
    names = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
    n, o = note[:-1], int(note[-1]); return 440 * 2 ** ((names[n] + (o - 4) * 12) / 12)

# instruments
def strings(notes, d, a=0.08, decay=1.4, bright=6):
    t = t_(d); s = np.zeros_like(t)
    for n in notes:
        f = hz(n) * (1 + 0.002 * np.sin(2 * np.pi * 5.5 * t))
        for h in range(1, bright + 1): s += np.sin(2 * np.pi * f * h * t + h) / h ** 1.3
    return s * np.minimum(1, t / a) * np.exp(-t / decay) / len(notes)
def pluck(note, d=0.6, decay=0.18):
    t = t_(d); f = hz(note)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) + 0.15 * np.sin(6 * np.pi * f * t)) * env(d, 0.002, decay)
def bell(note, d=2.0):
    t = t_(d); f = hz(note)
    return sum(np.sin(2 * np.pi * f * m * t) * w * np.exp(-t / (1.2 / m)) for m, w in [(1, 1), (2.76, .45), (5.4, .25), (8.9, .12)])
def kick(d=0.35):
    t = t_(d); f = 48 + 90 * np.exp(-t / 0.04); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(d, 0.001, 0.12)
def timpani(d=1.6):
    t = t_(d); return (np.sin(2 * np.pi * 73 * t) + 0.5 * np.sin(2 * np.pi * 110 * t)) * env(d, 0.003, 0.5) + 0.15 * lp(noise(d), .2) * env(d, .001, .05)
def hat(d=0.06): return hp(noise(d), 0.5) * env(d, 0.0005, 0.018)
def wood(freq=1250, d=0.12):
    t = t_(d); return (np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * freq * 2.3 * t)) * env(d, .0005, .025)
def clack(d=0.09): return (hp(noise(d), .35) * 0.6 + wood(2600, d) * 0.7) * env(d, .0005, .02)
def crash(d=1.4): return hp(noise(d), .25) * env(d, .002, .45)
def rustle(d): x = hp(lp(noise(d), .25), .05); return x * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * t_(d))))
def whoosh(d=0.8):
    t = t_(d); x = noise(d); out = np.empty_like(x); acc = 0.0
    k = 0.02 + 0.5 * np.sin(np.pi * t / d) ** 2
    for i, v in enumerate(x): acc += k[i] * (v - acc); out[i] = acc
    return out * np.sin(np.pi * t / d) ** 2
def murmur(d): return lp(noise(d), .03) * 3
def screech(d=0.6):
    t = t_(d); f = hz('A#4') * (1 + 0.012 * np.sin(2 * np.pi * 9 * t))
    return np.sign(np.sin(2 * np.pi * f * t)) * 0.25 * env(d, .01, .25) + strings(['A4', 'A#4', 'B3'], d, .01, .3)
def riser(d):
    t = t_(d); f = 180 + 600 * (t / d) ** 2; return np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 2

def finish(b, path, gain=0.9):
    b = np.tanh(b * 1.2); b *= gain / np.max(np.abs(b))
    fade = int(SR * 0.4); b[-fade:] *= np.linspace(1, 0, fade)[:, None]
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((b * 32767).astype('<i2').tobytes())

BEAT = 0.5  # 120 BPM

def maestro():
    b = buf(15.0)
    m = murmur(0.5); add(b, 0, m * np.linspace(1, 0, len(m)), .5)
    add(b, 0.4, riser(0.6), .12)
    add(b, 1.0, strings(['A2', 'E3', 'A3', 'C#4'], 1.2), .55)            # downbeat
    add(b, 2.0, screech(0.7), .45, .3)                                    # the wrong entry
    add(b, 2.0, strings(['A2', 'D#3'], .8, .01, .3), .35, -.3)
    add(b, 3.0, crash(1.6), .5); add(b, 3.0, timpani(), .5)               # the stand falls
    add(b, 3.0, rustle(2.2) * np.linspace(1, .2, int(SR * 2.2)), .18)
    for k, (tt, f) in enumerate([(3.37, 900), (3.61, 1500), (3.83, 700), (4.21, 1300), (4.38, 1100), (4.77, 800), (4.94, 1600), (5.18, 1000)]):
        add(b, tt, wood(f), .35, (-1) ** k * .5)                           # off-grid chaos
    add(b, 5.5, wood(1250), .8); add(b, 5.75, wood(1250), .8)            # tok tok
    add(b, 5.8, whoosh(0.45), .25)                                        # sheets gather
    for i in range(12, 24): add(b, i * BEAT, kick(), .55)                 # pulse 6.0–11.5
    for i in range(12, 24): add(b, i * BEAT + .25, hat(), .3)
    for k, n in enumerate(['A3', 'C#4', 'E4', 'F#4', 'A4', 'B4', 'C#5', 'E5']):
        add(b, 6.75 + k * 0.125, pluck(n), .32, -.4 + k * .1)             # notes pop
    for k, n in enumerate(['A4', 'C#5', 'E5', 'A5']):
        add(b, 7.75 + k * 0.25, pluck(n, .8, .3), .28)                    # notes stretch into bars
    add(b, 8.5, whoosh(0.8), .4)                                          # staves -> light lines
    for k, n in enumerate(['A4', 'B4', 'C#5', 'E5', 'F#5', 'A5']):
        add(b, 9.5 + k * BEAT, clack(), .5); add(b, 9.5 + k * BEAT, bell(n, 1.2), .16 + k * .02)  # lights switch on
    add(b, 9.5, strings(['A2', 'E3'], 2.6, 1.8, 3.0), .3)                 # build
    add(b, 12.0, strings(['A2', 'E3', 'A3', 'C#4', 'E4', 'A4'], 3.0, .02, 1.6, 7), .7)  # final chord
    add(b, 12.0, timpani(2.0), .55); add(b, 12.0, kick(), .5)
    add(b, 12.6, bell('E6', 2.0), .22, .3); add(b, 12.85, bell('C#6', 2.0), .2, -.3)    # door chime
    add(b, 12.0, lp(noise(3.0), .02) * np.linspace(0, 1, int(SR * 3.0)) * 2, .12)        # store ambience
    return b

def t1():  # shape match cut: baton -> stand
    b = buf(4.0)
    add(b, 0.3, riser(0.5), .1); add(b, 0.8, strings(['A2', 'E3', 'A3'], 1.0), .5)
    add(b, 1.8, whoosh(0.6), .3); add(b, 2.4, crash(1.4), .45); add(b, 2.4, timpani(), .45)
    add(b, 2.4, rustle(1.4) * np.linspace(1, 0, int(SR * 1.4)), .2)
    return b

def t2():  # masking-tape wipe
    b = buf(4.5)
    add(b, 0.0, lp(noise(4.5), .02) * 1.5, .15)
    t = t_(1.4); rip = hp(noise(1.4), .3) * (0.6 + 0.4 * np.sin(2 * np.pi * 38 * t)) * np.sin(np.pi * t / 1.4) ** .5
    add(b, 1.0, rip, .35)                                                 # tape peel
    add(b, 2.45, wood(900), .5); add(b, 2.5, bell('E5', 1.8), .22)        # crisp edge revealed
    return b

def t3():  # kinetic type on the beat
    b = buf(4.5)
    for i in range(6): add(b, i * BEAT, kick(), .55); add(b, i * BEAT + .25, hat(), .28)
    for k, tt in enumerate([0.5, 1.0, 1.5, 2.0]): add(b, tt, clack(), .4); add(b, tt, pluck(['A3', 'C#4', 'E4', 'A4'][k], .6, .25), .3)
    add(b, 2.0 + .03, wood(1600), .5)                                     # snap into grid
    add(b, 3.0, strings(['A2', 'E3', 'A3', 'C#4'], 1.5, .01, .9), .55); add(b, 3.0, timpani(1.4), .4)
    return b

if __name__ == '__main__':
    finish({'maestro': maestro, 't1': t1, 't2': t2, 't3': t3}[sys.argv[1]](), sys.argv[2])
