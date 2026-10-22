# FACE-1 sound: voice (native lip-synced audio of the Seedance clips + one TTS VO line), original music, SFX on every visual event.
import numpy as np, subprocess
from scipy.signal import butter, sosfilt, fftconvolve
SR, D = 48000, 30.0; N = int(D*SR); t = np.arange(N)/SR; rng = np.random.default_rng(3)
def load(f, ss=0, to=None, tempo=None):
    af = []
    if tempo: af.append(f"atempo={tempo}")
    cmd = ['ffmpeg','-v','error','-ss',str(ss)] + (['-to',str(to)] if to else []) + ['-i',f] + (['-af',','.join(af)] if af else []) + ['-ac','1','-ar',str(SR),'-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).copy()
bp = lambda x, lo, hi: sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
hp = lambda x, f: sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
voice = np.zeros(N, np.float32)
def put(buf, sig, at, g=1.0, fade=.015):
    sig = sig.copy(); f = int(fade*SR)
    if len(sig) > 2*f: sig[:f] *= np.linspace(0,1,f); sig[-f:] *= np.linspace(1,0,f)
    i = int(at*SR); n = min(len(sig), N-i); buf[i:i+n] += sig[:n]*g
# edit decision list for the voice (same cuts as face1.html)
put(voice, load('v1.mp4', 0, 3.9), 0.0)
put(voice, load('v2.mp4', 0, 2.05), 3.9); put(voice, load('v2.mp4', 3.18, 6.05), 5.95)   # repeated phrase removed
put(voice, load('v3.mp4', 0, 6.6), 8.82)
vo = load('t4.wav', tempo=1.05)
ir = np.exp(-np.arange(int(.35*SR))/SR*14) * rng.standard_normal(int(.35*SR)) * .08; ir[0] = 1      # small room to match the clips
vo = fftconvolve(vo, ir)[:len(vo)+int(.2*SR)]; vo = hp(vo, 90)
put(voice, vo, 15.6, .9)
put(voice, load('v5.mp4', 0, 6.05), 21.3)
# music: 96 BPM, Am – F – C – G, pluck arpeggio + sub + soft kit
bpm = 96; beat = 60/bpm; mus = np.zeros(N, np.float32)
def note(f, at, dur, g, kind='pluck'):
    d = np.arange(int(dur*SR))/SR
    if kind == 'pluck': s = (np.sin(2*np.pi*f*d) + .35*np.sin(2*np.pi*2*f*d) + .12*np.sin(2*np.pi*3*f*d)) * np.exp(-d*5.5)
    elif kind == 'pad': s = (np.sin(2*np.pi*f*d) + .5*np.sin(2*np.pi*f*1.003*d)) * np.minimum(1, d/.4) * np.minimum(1, (dur-d)/.6)
    else: s = np.sin(2*np.pi*f*d) * np.exp(-d*2.2)
    put(mus, s.astype(np.float32), at, g, .005)
mid = lambda m: 440*2**((m-69)/12)
chords = [(57, [57,60,64,69]), (53, [53,57,60,65]), (48, [48,52,55,60]), (55, [55,59,62,67])]
bar = 4*beat
for b in range(int(D/bar)+1):
    root, ch = chords[(b//2) % 4]; t0 = b*bar
    if t0 >= 27.3: break
    for k in range(8):
        at = t0 + k*beat/2
        if at < 27.3 and not (15.4 < at < 21.2 and k % 2): note(mid(ch[(k*3) % 4]+12), at, .5, .05)
    note(mid(root-12), t0, bar, .05, 'pad')
for k in range(int(27.3/beat)):
    at = k*beat
    if 3.9 <= at < 15.3 or 21.3 <= at < 27.3:
        if k % 2 == 0:
            d = np.arange(int(.25*SR))/SR; put(mus, (np.sin(2*np.pi*(55+70*np.exp(-d*30))*d)*np.exp(-d*14)).astype(np.float32), at, .16)
        if at >= 8.8: d = np.arange(int(.05*SR))/SR; put(mus, (hp(rng.standard_normal(len(d)), 7000)*np.exp(-d*90)).astype(np.float32), at + beat/2, .03)
d = np.arange(int(5.8*SR))/SR; put(mus, (np.sin(2*np.pi*55*d)*.6 + bp(rng.standard_normal(len(d)), 200, 1200)*(d/5.8)**2*.5).astype(np.float32), 15.45, .06)
note(mid(48), 27.35, 2.6, .07, 'pad'); note(mid(64), 27.35, 2.6, .05, 'pad'); note(mid(67), 27.35, 2.6, .04, 'pad')
for i, m in enumerate([72, 76, 79]): note(mid(m), 27.5 + i*.1, 2.2, .05, 'bell')
env = np.abs(voice); env = lp(env, 6); env = env/(env.max()+1e-9)
duck = 1 - .62*np.clip(env*4, 0, 1); mus *= duck.astype(np.float32)
# SFX tied to the picture
sfx = np.zeros(N, np.float32)
def whoosh(at, dur=.45, g=.10, up=True):
    d = np.arange(int(dur*SR))/SR; e = np.sin(np.pi*d/dur)**2
    s = bp(rng.standard_normal(len(d)), 300, 3000 if up else 1500)*e; put(sfx, s.astype(np.float32), at, g)
def paper(at, g=.07): d = np.arange(int(.16*SR))/SR; put(sfx, (bp(rng.standard_normal(len(d)), 800, 6000)*np.sin(np.pi*d/.16)**2).astype(np.float32), at, g)
def tick(at, g=.05): d = np.arange(int(.03*SR))/SR; put(sfx, (bp(rng.standard_normal(len(d)), 2000, 8000)*np.exp(-d*160)).astype(np.float32), at, g)
def boom(at, g=.22): d = np.arange(int(.6*SR))/SR; put(sfx, (np.sin(2*np.pi*(45+60*np.exp(-d*20))*d)*np.exp(-d*6) + bp(rng.standard_normal(len(d)), 1500, 6000)*np.exp(-d*60)*.3).astype(np.float32), at, g)
boom(1.62); whoosh(3.45, .5); paper(4.05); paper(5.0); tick(5.95, .06); paper(7.55)
whoosh(8.3, .5); tick(9.9, .05); tick(13.5, .04)
for k in range(33): tick(13.62 + 1.1*(1-(1-k/33)**.5), .025)
whoosh(15.35, .6, .09, False)
for i in range(40): d = np.arange(int(.03*SR))/SR; put(sfx, (bp(rng.standard_normal(len(d)), 1200, 5000)*np.exp(-d*120)).astype(np.float32), 18.6 + i*.03, .012)
whoosh(21.05, .3, .12); whoosh(23.5, .35, .08); whoosh(25.95, .3, .07)
for at in (27.5, 27.6, 27.7): tick(at, .05)
mix = voice*1.0 + mus + sfx
f = int(.5*SR); mix[-f:] *= np.linspace(1, 0, f)
mix = np.tanh(mix*1.3)/1.3
st = np.stack([mix, mix], 1)
import wave; w = wave.open('mix.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(st, -1, 1)*32767).astype('<i2').tobytes()); w.close()
print('mix ok', np.abs(mix).max())
