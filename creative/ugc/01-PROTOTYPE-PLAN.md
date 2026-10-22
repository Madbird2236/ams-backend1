# UGC prototype 01 — «Klebeband» (plan for approval, no credits spent)

## 1. Concept
- **One real painting detail:** pull the masking tape off while the paint is still wet, at a flat angle and slowly. If you wait until it is dry, the paint film tears with the tape and the edge frays.
- **Why this tip:** it is real, useful for anyone painting at home, and visual in one close-up (a crisp edge vs. a torn one). It continues «Die Kante macht den Meister.»
- **Audience:** B2C (owners, tenants, DIY).
- **Objective:** trust and reach; secondary: «the people who know this are the people to call».
- **KPI:** watch time to 100 %, saves and shares, profile visits.
- **No offer, no promise.** It is a tip; AMS is the expert, not the seller.

## 2. Script (Swiss Standard German, ~33 words, ~13 s of speech)
| # | Time | Shot | Words (presenter) | Subtitle (discreet) |
|---|---|---|---|---|
| 1 | 0.0–2.8 | **A-roll**, medium, phone at chest height. Presenter in white painter's clothes, holding a tape roll, freshly painted wall behind | «Der häufigste Fehler beim Streichen? Das Klebeband.» | Der häufigste Fehler beim Streichen? |
| 2 | 2.8–6.0 | **B-roll** close-up: roller along the taped edge, wet paint | (VO) «Viele warten, bis die Farbe trocken ist – und ziehen dann ab.» | Viele warten, bis die Farbe trocken ist … |
| 3 | 6.0–9.0 | **Detail** macro: tape pulled back flat and slowly while still wet; a razor-sharp line appears | (VO) «Besser: noch feucht abziehen. Flach und langsam.» | Besser: noch feucht abziehen. |
| 4 | 9.0–11.5 | **Detail** comparison: dried tape pulled, the paint film tears and the edge frays | (VO) «Sonst reisst der Farbfilm mit.» | Sonst reisst der Farbfilm mit. |
| 5 | 11.5–15.0 | **A-roll**, medium: he runs a finger near the crisp edge, looks into the lens, small smile | «Saubere Kante. So einfach.» | Saubere Kante. So einfach. |

- **End:** no logo card. Discreet lower line in the last 2 s: «AMS Malergeschäft · Tipps vom Profi».
- **Labels:** «KI-generiert» (see section 6).
- **Language check:** «reisst» (ss); «Klebeband» is the common term in Switzerland («Malerabdeckband» is also correct).
- **Claims check:** a craft tip, no promise.

## 3. Shot rules (from the reference analysis)
- **Craft order must be correct:** paint → pull wet → result. Comparison (4) is clearly «the wrong way».
- **Face only in A-roll (1 and 5):** lip-sync where eye contact matters; hands and tape carry the B-roll.
- **One identity sheet fixes:** face, beard or no beard, hair length and style, clothes, rings/watch. Every shot is checked against it (the reference failed on the hair).
- **Phone grammar:** slight handheld drift, natural daylight, real room tone, no colour grading, no transitions except hard cuts.
- **Subtitles:** white Inter SemiBold ~46 px, soft shadow, max 2 lines, inside the 9:16 safe zone (clear of the Reels/TikTok UI).

## 4. What can be done where (verified 2026-10-22)
| Step | Local (this environment, free) | Needs Higgsfield or another service (credits) |
|---|---|---|
| Script, shot list, timing, subtitles | ✅ | — |
| Draft VO for timing | ✅ Piper «Thorsten» (German, not Swiss, 16 kHz): **timing only** | — |
| Final Swiss voice | ❌ | Higgsfield TTS (ElevenLabs v4, Qwen TTS with a style instruction, Seed Audio) **or** Adriano's Voice Studio (his computer) |
| Realistic human presenter, consistent identity | ❌ no local model can generate realistic people | Higgsfield: identity sheet (AI Influencer / image model), then video with image references: **Seedance 2.0** (image/audio references, native audio, 4–15 s), **Wan 2.7** (synchronised audio, character-consistent), **Kling 3.0** (multi-shot, audio) |
| Lip-sync to a given voice | ❌ (no local lip-sync model; Wav2Lip/SadTalker weights sit on blocked hosts) | Seedance 2.0 / Wan 2.7 with `audio_references` (the provided voice drives the speech) |
| B-roll close-ups (hands, tape, roller) | ❌ realistic footage cannot be generated locally | Image-to-video (Kling / Seedance), or **real phone footage shot by an AMS painter** (best and free) |
| Edit, subtitles, room tone, loudness (−14 LUFS), «KI-generiert» label, QA frame by frame | ✅ local engine + ffmpeg | — |

Nothing above was generated. Model capabilities come from Higgsfield's catalogue (read only, no cost). **Exact credit prices are not shown in the catalogue;** a quote is required before any generation.

## 5. Production flow (after approval)
1. **Identity:** 1 presenter sheet (front, ¾, profile, back of head; clothes; hands). Adriano approves the face. Gate 1.
2. **Voice:** Swiss voice via Higgsfield TTS **or** Voice Studio; I cut it to the timing above and measure the reading time of the subtitles. Gate 2.
3. **A-roll** (shots 1 and 5): video with the identity sheet and the voice as audio reference.
4. **B-roll** (2, 3, 4):
   - preferably **real** close-ups filmed by AMS (15 min on a site, any phone);
   - otherwise image-to-video without faces.
5. **Local post:** hard cuts, room tone, subtitles, lower line, «KI-generiert» label, −14 LUFS / −1.5 dBTP.
6. **QA before showing:**
   - lip-sync on plosives (b, p, m);
   - identity against the sheet (hair!);
   - hands: finger count;
   - tape physics;
   - craft order;
   - legibility.

**Cheapest test first:** generate only shot 1 (≈3 s A-roll) to judge identity and lip-sync before paying for the rest.

## 6. Risks and decisions for Adriano
- **Transparency:** a realistic AI presenter must not pass as a real AMS employee. Platforms (Meta, TikTok) require AI-generated realistic content to be labelled, and Swiss consumers react badly to discovered fakes. Proposal: label «KI-generiert», no invented name, no «I work at AMS». Strongest alternative: a **real AMS painter** on a phone (higher trust, zero credits); AI then only for tests or when no one is available.
- **Branding on clothes:** an AMS logo on the virtual presenter strengthens the «employee» impression. Proposal: plain white workwear and AMS only in the lower line.
- **Cost:** to be quoted before generation. Order of magnitude from earlier sessions: video models are the expensive part (tens of credits per clip). Start with the 3 s test.

## 7. Questions for approval
1. Topic: tape tip (painting) as proposed, or a drywall detail (e.g. boards not standing directly on the floor: keep a gap)?
2. AI presenter with a «KI-generiert» label, or a real AMS painter on a phone with Julia doing script and post?
3. Voice: Higgsfield TTS or your Voice Studio?
4. Budget for the 3 s test (shot 1 only): after the quote.
