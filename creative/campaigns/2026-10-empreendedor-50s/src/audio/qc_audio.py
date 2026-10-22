# Audio QC: transcribe the final mix and measure each word's offset against the picture's timeline.
import json, numpy as np
from faster_whisper import WhisperModel
W = json.load(open("words_final.json")); VO, P1, P2, PAD = .35, 28.70, 41.60, .6
sh = lambda x: x + VO + (PAD if x >= P1 else 0) + (PAD if x >= P2 else 0)
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe("mix.wav", language="de", word_timestamps=True)
H = [(w.start, w.word.strip()) for s in segs for w in s.words]
d = np.array([min(H, key=lambda h: abs(h[0] - sh(s)))[0] - sh(s) for s, e, wd in W])
print(f"sync vs picture: mean {d.mean()*1000:.0f} ms, median abs {np.median(np.abs(d))*1000:.0f} ms, 95% abs {np.percentile(np.abs(d),95)*1000:.0f} ms, words {len(H)}/{len(W)}")
print("transcript:", " ".join(h[1] for h in H))
