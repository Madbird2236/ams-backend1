# Voice edit: tighten pauses (> 0.42 s → ~0.30 s) on the existing Higgsfield take, keep word timings mapped.
# Then (ffmpeg): atempo=1.05 (pitch kept), highpass 80 Hz, +3 dB @ 3.2 kHz presence, −2 dB @ 180 Hz, compressor 3:1.
# Input: vo.mp3 (Higgsfield text2speech_v2/elevenlabs, voice element «Ams-»), words.json (faster-whisper small, de, word timestamps)
import json, subprocess, numpy as np
W = json.load(open("words.json"))
SR=48000
a = np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i","vo.mp3","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout,np.float32)
cur=max(0,W[0][0]-0.08); segs=[]
for i in range(len(W)-1):
    gap=W[i+1][0]-W[i][1]
    if gap>0.42:
        end=W[i][1]+0.12; segs.append((cur,end)); cur=W[i+1][0]-0.18
segs.append((cur,W[-1][1]+0.5))
pieces=[]; tmap=[]; t=0.0
for s,e in segs:
    pieces.append(a[int(s*SR):int(e*SR)]); tmap.append((s,e,t)); t+=e-s
y=np.concatenate(pieces)
def m(x):
    for s,e,o in tmap:
        if s-1e-6<=x<=e+1e-6: return o+(x-s)
    return None
NW=[[round(m(w[0]),3),round(m(w[1]),3),w[2]] for w in W]
open("cut.f32","wb").write(y.astype(np.float32).tobytes())
TEMPO=1.05
json.dump([[round(s/TEMPO,3),round(e/TEMPO,3),w] for s,e,w in NW],open("words_final.json","w"),ensure_ascii=False)
print("cut dur",round(len(y)/SR,2),"final",round(len(y)/SR/TEMPO,2))
# ffmpeg -f f32le -ar 48000 -ac 1 -i cut.f32 -af "atempo=1.05,highpass=f=80,equalizer=f=3200:t=q:w=1.2:g=3,equalizer=f=180:t=q:w=1:g=-2,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=4" -ar 48000 voice_final.wav
