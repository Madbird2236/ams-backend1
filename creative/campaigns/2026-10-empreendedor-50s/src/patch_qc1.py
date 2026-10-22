# QC round 1 fixes (independent critic: 1 blocker, 6 major). Applied identically locally and in the render sandbox.
import json, sys
p = sys.argv[1] if len(sys.argv) > 1 else "erfolg.html"
s = open(p).read()
def R(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (s.count(a), a[:80]); s = s.replace(a, b)

# B1: official logo (negative variant: original blue symbol, white text, Arial/Helvetica 700, original tracking)
R('''<text x="72" y="22" font-family="IS" font-weight="700" font-size="17" fill="currentColor">AMS</text><text x="72" y="40" font-family="IS" font-weight="700" font-size="17" fill="currentColor">Malergeschäft</text>''',
  '''<text x="72" y="22" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="17" letter-spacing="-0.3" fill="#FFFFFF">AMS</text><text x="72" y="40" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="17" letter-spacing="-0.4" fill="#FFFFFF">Malergeschäft</text>''')
R('style="display:block;width:440px;color:#F2EEE6"', 'style="display:block;width:560px"')
R('#end { position:absolute; left:80px; top:520px; opacity:0; }', '#end { position:absolute; left:260px; top:1560px; opacity:0; }')

# M1: labels respect the current alpha; readable size and contrast (≥ 40 px, grey lifted to 4.5:1+)
R('const label = (txt, x, y, col = BONE, size = 30, align = "left", a = 1) => { if (a <= 0) return; g.globalAlpha = a; g.font = `${size}px JB`; g.fillStyle = col; g.textAlign = align; g.fillText(txt, x, y); g.globalAlpha = 1; g.textAlign = "left"; };',
  'const label = (txt, x, y, col = BONE, size = 40, align = "left", a = 1) => { if (a <= 0) return; const pa = g.globalAlpha; g.globalAlpha = pa * a; g.font = `${Math.max(40, size)}px JB`; g.fillStyle = col; g.textAlign = align; g.fillText(txt, x, y); g.globalAlpha = pa; g.textAlign = "left"; };')
R('GREY = "#5A6170"', 'GREY = "#8A93A3"')
R('      label("100 %", 780, CY + 118, GREY, 28, "center");\n', '')
R('label("+ MEHR", 180 + fill, CY + 118, BONE, 32, "right", prog(t, w(32) + .1, .2));', 'label("+ MEHR", 180 + fill, CY + 118, BLUE, 44, "right", prog(t, w(32) + .1, .2));')

# M2: fonts loaded before any canvas frame
R('window.seek = (t) => {\n  tNow = t;', 'const FONTS = Promise.all(["40px JB", "64px IB", "86px IB", "40px IS"].map((f) => document.fonts.load(f)));\nwindow.seek = async (t) => {\n  await FONTS; tNow = t;')

# M3: «Lerne, mit Geld umzugehen» gets its own beat: coins drop and stack, then become the revenue column
R('''    if (!split) {
      g.globalAlpha = appear; rect(x0, base - H, colW, H, BLUE); g.globalAlpha = 1;
      line([[120, base], [960, base]], 4, GREY);
      label("UMSATZ", CX, base + 60, BONE, 30, "center", appear);''',
  '''    if (!split) {
      // coins: one per beat of «mit Geld umzugehen», stacking on the base line; they turn into the column on «Umsatz»
      const melt = prog(t, w(37) - .1, .35);
      for (let c = 0; c < 6; c++) {
        const ck = spring(prog(t, w(34) + c * .17, .4)); if (ck <= 0 || melt >= 1) continue;
        const cy = lerp(700, base - 18 - c * 36, ck);
        g.globalAlpha = 1 - melt; g.fillStyle = BG; g.strokeStyle = BONE; g.lineWidth = 5;
        g.beginPath(); g.ellipse(CX, cy, 110, 18, 0, 0, 7); g.fill(); g.stroke(); g.globalAlpha = 1;
      }
      if (prog(t, w(35), .2) > 0 && melt < 1) label("CHF", CX + 140, base - 40, BONE, 40, "left", prog(t, w(35), .2) * (1 - melt));
      if (melt > 0) { g.globalAlpha = Math.min(1, melt * 1.5); rect(x0, base - H, colW, H, BLUE); g.globalAlpha = 1; }
      line([[120, base], [960, base]], 4, GREY);
      label("UMSATZ", CX, base + 64, BONE, 40, "center", prog(t, w(38) - .05, .25));''')
# column turns coral with a short top-down wipe; GEWINN label drawn above the falling block
R('''      if (fall < 1) { g.save(); g.translate(x0 + colW / 2 + gx, base - keep - (H - keep) / 2 + gy); g.rotate(rot); rect(-colW / 2, -(H - keep) / 2, colW, H - keep - 6, CORAL); g.font = "34px JB"; g.fillStyle = BG; g.textAlign = "center"; g.fillText("KOSTEN", 0, 0); g.restore(); g.textAlign = "left"; }''',
  '''      const wipe = prog(t, w(40) - .05, .15);
      if (fall < 1) { g.save(); g.translate(x0 + colW / 2 + gx, base - keep - (H - keep) / 2 + gy); g.rotate(rot); rect(-colW / 2, -(H - keep) / 2, colW, H - keep - 6, BLUE); rect(-colW / 2, -(H - keep) / 2, colW, (H - keep - 6) * wipe, CORAL); g.font = "40px JB"; g.fillStyle = BG; g.textAlign = "center"; g.globalAlpha = wipe; g.fillText("KOSTEN", 0, 0); g.globalAlpha = 1; g.restore(); g.textAlign = "left"; }''')
R('''      if (!ecg) { rect(x0, base - keep, colW, keep, BLUE); label("GEWINN", CX, base + 60, BLUE, 32, "center"); }''',
  '''      if (!ecg) { rect(x0, base - keep, colW, keep, BLUE); label("GEWINN", CX, base + 64, BLUE, 44, "center"); }''')

# minor: the maze clears before the timeline starts
R('const tl = prog(t, w(58) - .15, .4);', 'const tl = prog(t, w(58) + .2, .3);')
R('const y = 1150, head = lerp(120, 560, io(prog(t, w(58), w(63) - w(58))));', 'const y = 1150, head = lerp(120, 560, io(prog(t, w(58) + .2, w(63) - w(58) - .2)));')
R('line([[120, y], [1000, y]], 3, DIM);', 'g.globalAlpha = tl; line([[120, y], [1000, y]], 3, DIM); g.globalAlpha = 1;')

# M4: one continuous line — the «jetzt» line IS the start of the growth chart; the camera follows it to the fork
R('  if (t >= w(49) - .2 && t < w(65) - .1) {', '  if (t >= w(49) - .2 && t < w(65) + .05) {')
R('''    const cm = io(prog(t, w(72) - .2, 1.1)), camX = 660 * cm, camY = -240 * cm;
    g.save(); g.translate(-camX, -camY);''',
  '''    const cm = io(prog(t, w(65), w(74) - w(65))), camX = 1000 * cm, camY = -400 * cm;
    g.save(); g.translate(-camX, -camY);
    const hist = 1 - .7 * prog(t, w(76), .8);                     // the past dims once the fork is the subject
    g.globalAlpha = hist; line([[120, 1150], [560, 1150], [820, 630]], 8, BLUE); g.globalAlpha = 1;''')
R('''    const KP = [[120, 1500, w(65) - .1], [560, 1180, w(67) - .05], [560, 1480, w(67) + .2], [780, 1220, w(71) - .1], [780, 1470, w(71) + .15], [960, 1060, w(72) + .2]];''',
  '''    const KP = [[820, 630, w(67) - .05], [820, 1060, w(67) + .2], [1060, 820, w(71) - .1], [1060, 1160, w(71) + .15], [1300, 900, w(72) + .2]];''')
R('''      const fall = y1 > y0; line([[x0, y0], [lerp(x0, x1, k), lerp(y0, y1, k)]], 10, fall ? CORAL : BLUE);
      if (fall && k > .9) dot(x1, y1, 10, CORAL);''',
  '''      const fall = y1 > y0; g.globalAlpha = hist; line([[x0, y0], [lerp(x0, x1, k), lerp(y0, y1, k)]], 10, fall ? CORAL : BLUE);
      if (fall && k > .9) dot(x1, y1, 10, CORAL); g.globalAlpha = 1;''')
R('    const ax = 960, ay = 1060;', '    const ax = 1300, ay = 900;')
R('label("AUFGEBEN", ax + 100 + lowL, ay + 200, GREY, 30, "right", giveUp);', 'label("AUFGEBEN", ax + 100 + lowL, ay + 210, GREY, 40, "right", giveUp);')
R('label("AUFBAUEN", ax + 24, ay - 30, BLUE, 30, "left", up0);', 'label("AUFBAUEN", ax + 24, ay - 30, BLUE, 40, "left", up0);')
R('label(words[k], ax + k * S + S / 2 + 20, ay - (k + 1) * S - 26, BONE, 30, "center", kk);', 'label(words[k], ax + k * S + S / 2 + 20, ay - (k + 1) * S - 28, BONE, 40, "center", kk);')

# M6 + minor: end card — counter runs to TAG 1'000, slow push-in on the built block, logo centred under it
R('''    label("TAG " + Math.min(total, Math.max(1, Math.floor(builtF) + 1)), CX, base + 64, BONE, 30, "center", prog(t, t0, .3));''',
  '''    const days = Math.round(1000 * Math.pow(clamp(builtF / total), 1.6));
    label("TAG " + String(Math.max(1, days)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, "'"), CX, base + 70, BONE, 44, "center", prog(t, t0, .3));''')
R('''  if (t >= w(91) - .1) {
    const dk''', '''  if (t >= w(91) - .1) {
    const pi = 1 + .06 * io(prog(t, D - 3.2, 3.2)); g.save(); g.translate(CX, 1250); g.scale(pi, pi); g.translate(-CX, -1250);
    const dk''')
R('''    label("TAG " + String''', '''    g.restore(); label("TAG " + String''')

# size/contrast of remaining small labels
R('label("ANDERE", 800, CY + 190, GREY, 28, "center");', 'label("ANDERE", 800, CY + 190, GREY, 40, "center");')
R('label("DU", 380, CY + 250, BONE, 28, "center",', 'label("DU", 380, CY + 250, BONE, 44, "center",')
R('label("KUNDE", cx, CY + 110, BONE, 28, "center", ck);', 'label("KUNDE", cx, CY + 116, BONE, 40, "center", ck);')
R('label("VERSPROCHEN", 780, CY - 96, BONE, 28, "center");', 'label("VERSPROCHEN", 780, CY - 96, BONE, 40, "center");')
R('label("AM LEBEN", 960, y0 + 90, BLUE, 30, "right",', 'label("AM LEBEN", 960, y0 + 96, BLUE, 44, "right",')
R('label("PERFEKT", flag, y + 60, GREY, 28, "center");', 'label("PERFEKT", flag, y + 66, GREY, 40, "center");')
R('label("JETZT", head, y + 60, BLUE, 32, "center", prog(t, w(64), .2));', 'label("JETZT", head, y + 66, BLUE, 44, "center", prog(t, w(64), .2) * (1 - prog(t, w(65) - .1, .2)));')
R('if (dk > .5) label("ZUFALL", CX, CY + 200, GREY, 30, "center", (1 - dOut) * dk);', 'if (dk > .5) label("ZUFALL", CX, CY + 200, GREY, 44, "center", (1 - dOut) * dk);')
open(p, "w").write(s)
W = json.load(open(sys.argv[2] if len(sys.argv) > 2 else "words_final.json"))
open(p.replace(".html", "_built.html"), "w").write(s.replace("const RAW = /*WORDS*/[];", "const RAW = " + json.dumps(W, ensure_ascii=False) + ";"))
print("patched")
