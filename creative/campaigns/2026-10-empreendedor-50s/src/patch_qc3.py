# QC round 3: the CHF counter text is frame-locked in value AND position (no double image under motion blur).
import json, sys
p = sys.argv[1]; s = open(p).read()
a = 'g.fillText("CHF " + fmt(1250000 * io(prog(Math.round(t * 30) / 30, w(37) - .1, we(39) - w(37) + .1))), CX, base - H - 34);'
b = 'const rq = io(prog(Math.round(t * 30) / 30, w(37) - .1, we(39) - w(37) + .1)); g.fillText("CHF " + fmt(1250000 * rq), CX, base - lerp(20, 880, rq) - 34);'
assert s.count(a) == 1; s = s.replace(a, b)
open(p, "w").write(s)
W = json.load(open(sys.argv[2]))
open(p.replace(".html", "_built.html"), "w").write(s.replace("const RAW = /*WORDS*/[];", "const RAW = " + json.dumps(W, ensure_ascii=False) + ";"))
print("patched")
