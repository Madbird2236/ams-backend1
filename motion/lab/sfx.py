"""Sound design for the motion lab (local synthesis, no samples)."""
import sys, os, numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'calibration'))
from synth import *  # noqa: buf, add, kick, wood, clack, crash, whoosh, bell, pluck, strings, timpani, hat, rustle, riser, lp, hp, noise, t_, env, finish, SR

def drone(d, f=55):
    t = t_(d); return (np.sin(2*np.pi*f*t) + .5*np.sin(2*np.pi*f*1.5*t+1) + .3*lp(noise(d), .01)*4) * np.minimum(1, t/1.5)
def ice(d=.5):
    out = np.zeros(int(SR*d)); r = np.random.default_rng(3)
    for k in range(18):
        i = int(r.random()*len(out)*.9); n = min(len(out)-i, 900)
        out[i:i+n] += hp(noise(n/SR), .6) * np.exp(-np.arange(n)/120) * r.random()
    return out
def scrape(d=.55):
    t = t_(d); x = lp(noise(d), .08) * (0.6 + .4*np.sin(2*np.pi*23*t)); return x*np.sin(np.pi*t/d)
def boom(d=1.0):
    t = t_(d); f = 40 + 60*np.exp(-t/.08); return np.sin(2*np.pi*np.cumsum(f)/SR)*env(d, .002, .35)
def rev_swell(d=.6):
    x = whoosh(d); return x[::-1]
def thump(d=.4): return kick(d)*1.4 + lp(noise(d), .1)*env(d, .001, .04)

def kt1():
    b = buf(14.0)
    add(b, 0.0, drone(7.0) * np.linspace(1, .6, int(SR*7.0)), .22)
    add(b, 1.0, ice(.7), .5)                                    # frost
    add(b, 1.6, rev_swell(.5), .35)                             # Winter flies back
    add(b, 2.55, rev_swell(.45), .45)                           # «zurück» rewind
    add(b, 3.1, whoosh(.4), .3)
    add(b, 4.13, thump(), .7)                                   # wardrobe lands
    add(b, 4.5, scrape(), .45)                                  # pushed aside
    add(b, 5.24, whoosh(.3), .35); add(b, 5.45, boom(), .35)    # crash zoom in
    add(b, 6.0, whoosh(.25), .35)                               # crash zoom out
    add(b, 6.53, thump(), .9); add(b, 6.53, crash(.8), .25)     # stamp «Perfekt.»
    t = t_(.6); add(b, 6.95, hp(noise(.6), .2)*np.sin(np.pi*t/.6)*(.7+.3*np.sin(2*np.pi*30*t)), .4)  # roller sweep
    add(b, 7.6, bell('E5', 1.5), .18)                            # clean surface
    add(b, 7.78, pluck('A4', .6, .2), .35); add(b, 8.22, pluck('C#5', .6, .2), .35)
    add(b, 8.45, wood(1500), .4)                                 # «?» bounces
    add(b, 8.9, strings(['A3', 'C#4', 'E4'], 3.0, .6, 2.0, 4), .25)
    add(b, 10.13, pluck('E5', .6, .25), .25)                     # «betroffenen»
    add(b, 10.81, pluck('A5', .8, .3), .3); add(b, 11.25, whoosh(.6), .2)  # surface + shine
    add(b, 12.0, bell('A5', 1.8), .2); add(b, 12.0, strings(['A2', 'E3', 'A3', 'C#4'], 2.0, .02, 1.2, 6), .35)
    return b


def vox1():
    b = buf(17.5)
    # light editorial bed: soft plucks on a 100 BPM grid, rests at the night beat
    beat = 0.6
    notes = ['A3', 'E4', 'C#4', 'E4']
    for i in range(int(17.5 / beat)):
        t = i * beat
        if 9.0 < t < 12.4: continue
        add(b, t, pluck(notes[i % 4], .5, .15), .10)
    t = t_(2.4); add(b, 2.4, hp(noise(2.4), .5) * .15 * np.sin(np.pi * t / 2.4) * (0.6 + .4 * np.sin(2 * np.pi * 9 * t)), .5)  # pen drawing the outline
    add(b, 1.14, wood(1800), .3)                                     # marker swipe
    for k, tt in enumerate([3.63, 4.03, 4.43]): add(b, tt, wood(1100 + 200 * k), .45); add(b, tt, pluck(['C#5', 'E5', 'A5'][k], .5, .2), .25)
    for k in range(3): add(b, 3.6 + k * .4, clack(), .25)            # counter ticks
    add(b, 5.2, whoosh(1.3), .35)                                    # tilt into 3D
    for k in range(5): add(b, 6.75 + k * .12, wood(700 + 90 * k), .45)  # pins drop
    add(b, 7.0, riser(.9), .12)                                      # route draws
    add(b, 8.03, bell('A5', 1.2), .22); add(b, 8.03, clack(), .3)    # «Ein Standard.» all icons at once
    add(b, 8.8, whoosh(1.4), .3)                                     # push into Lausanne
    add(b, 9.2, strings(['A2', 'E3'], 3.4, 1.0, 2.5, 3), .22)        # night pad
    for tt in [9.68, 10.71, 11.33]: add(b, tt, pluck('E5', .6, .25), .3); add(b, tt, wood(2000), .2)  # annotations
    add(b, 12.5, whoosh(1.3), .3)                                    # pull out
    add(b, 12.78, strings(['A3', 'C#4', 'E4', 'A4'], 4.5, .05, 2.2, 5), .3)
    add(b, 15.18, bell('A5', 1.8), .2)                               # CTA
    return b

if __name__ == '__main__':
    finish({'kt1': kt1, 'vox1': vox1}[sys.argv[1]](), sys.argv[2])
