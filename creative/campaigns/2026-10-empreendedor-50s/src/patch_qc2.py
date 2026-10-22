# QC round 2: camera follows the line head through the falls; logo clear of the grid; first coin on «Lerne».
import json, sys
p = sys.argv[1]; s = open(p).read()
def R(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:80]); s = s.replace(a, b)
R('const cm = io(prog(t, w(65), w(74) - w(65))), camX = 1000 * cm, camY = -400 * cm;',
  'const c1 = io(prog(t, w(66), w(71) - w(66))), c2 = io(prog(t, w(72) - .3, w(74) + .5 - w(72) + .3)), camX = 300 * c1 + 700 * c2, camY = -400 * c2;')
R('#end { position:absolute; left:260px; top:1560px; opacity:0; }', '#end { position:absolute; left:260px; top:500px; opacity:0; }')
R('const ck = spring(prog(t, w(34) + c * .17, .4));', 'const ck = spring(prog(t, w(33) + .05 + c * .27, .4));')
open(p, "w").write(s)
W = json.load(open(sys.argv[2]))
open(p.replace(".html", "_built.html"), "w").write(s.replace("const RAW = /*WORDS*/[];", "const RAW = " + json.dumps(W, ensure_ascii=False) + ";"))
print("patched")
