# UGC prototype 01 — «Klebeband» (plan for approval, no credits spent)

## 1. Concept
- **One real painting detail (corrected v2):** remove masking tape after the last coat, before the paint has fully cured, pulling flat and slowly. If the paint is already dry, score the edge with a cutter first, otherwise the paint film tears with the tape.
- **Why this tip:** it is real, useful for anyone painting at home, and visual in one close-up (a crisp edge vs. a torn one). It continues «Die Kante macht den Meister.»
- **Audience:** B2C (owners, tenants, DIY).
- **Objective:** trust and reach; secondary: «the people who know this are the people to call».
- **KPI:** watch time to 100 %, saves and shares, profile visits.
- **No offer, no promise.** It is a tip; AMS is the expert, not the seller.

## 2. Script v2 (Swiss Standard German, ~35 words, ~14 s) — technical correction 2026-10-22
v1 said «pull the tape while the paint is still wet» as a universal rule. **That is not universally correct.**
- The tape comes off after the **last** coat, before the paint has **fully cured**.
- With several coats, pulling while wet after coat 1 is wrong.
- If the paint is already dry, **score the edge with a cutter first**, then pull flat and slowly.
- Always follow the paint manufacturer's instructions.

| # | Time | Shot | Words (presenter) | Subtitle (discreet) |
|---|---|---|---|---|
| 1 | 0.0–2.6 | **A-roll**, medium, phone at chest height, tape roll in hand, freshly painted wall | «Häufigster Fehler beim Streichen? Das Klebeband.» | Häufigster Fehler beim Streichen? |
| 2 | 2.6–5.4 | **B-roll** detail: old, dried tape pulled, the paint film tears, frayed edge | (VO) «Zu lange drauf – und die Farbe reisst mit.» | Zu lange drauf – die Farbe reisst mit. |
| 3 | 5.4–9.6 | **Detail** macro: after the last coat, tape pulled back flat and slowly; a crisp line appears | (VO) «Nach dem letzten Anstrich abziehen, bevor sie durchtrocknet. Flach und langsam.» | Nach dem letzten Anstrich abziehen – flach und langsam. |
| 4 | 9.6–12.4 | **Detail**: cutter scoring along the tape edge on dry paint | (VO) «Schon trocken? Erst mit dem Cutter anritzen.» | Schon trocken? Erst anritzen. |
| 5 | 12.4–15.0 | **A-roll**: finger near the crisp edge, looks into the lens | «Saubere Kante.» | Saubere Kante. |

- **Lower line (last 2 s):** «AMS Malergeschäft · Tipps vom Profi».
- **Labels:** «KI-generiert» visible for the whole video.
- **Craft order:** problem (2) → right timing (3) → fallback for dry paint (4). No promise.

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
1. ~~Topic~~ decided: Klebeband (Adriano 2026-10-22).
2. ~~Presenter~~ decided: virtual presenter, clearly labelled as AI (Adriano 2026-10-22).
3. Voice: Higgsfield TTS or your Voice Studio?
4. Budget for the 3 s test (shot 1 only): after the quote.
