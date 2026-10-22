# UGC prototype 01 — «Klebeband» (plan for approval, no credits spent)

## 1. Concept
- **One real painting detail (v3, manufacturer-aligned):** too early (wet) smears the edge, too late (hard) tears the paint film. Right: once the paint is touch-dry, pull slowly at about 45°.
- **Why this tip:** it is real, useful for anyone painting at home, and visual in one close-up (a crisp edge vs. a torn one). It continues «Die Kante macht den Meister.»
- **Audience:** B2C (owners, tenants, DIY).
- **Objective:** trust and reach; secondary: «the people who know this are the people to call».
- **KPI:** watch time to 100 %, saves and shares, profile visits.
- **No offer, no promise.** It is a tip; AMS is the expert, not the seller.

## 2. Script v3 — aligned with tape manufacturers (2026-10-22)
**What the manufacturers say (web check):**
- **tesa:** pull the tape directly after the paint has *angetrocknet* (set / touch-dry), before it fully cures; ~45° (pages range 30–90°, 45° most consistent); slowly and evenly; work above 5 °C.
- **3M ScotchBlue 2090 (US page):** remove when the paint is dry to the touch; pull back on itself at 45°. The Canadian page says «completely dry», so manufacturers differ in detail.
- **Consequence:** «still wet» (v1) is wrong, and «flat» (v2) contradicts the ~45° guidance. The safe common denominator is **touch-dry, slowly, about 45°**. A small «Herstellerangaben beachten» note covers product differences.
- **The cutter tip** (v2) is trade practice, not manufacturer guidance, so it is dropped from the script.

| # | Time | Shot | Words | Subtitle |
|---|---|---|---|---|
| 1 | 0.0–2.8 | **A-roll** medium, phone at chest height, tape roll in hand, freshly painted wall | «Häufigster Fehler beim Streichen? Das Klebeband.» | Häufigster Fehler beim Streichen? |
| 2 | 2.8–5.6 | **B-roll** detail: tape pulled while the paint is still wet; the edge smears | (VO) «Zu früh abgezogen, verschmiert die Kante.» | Zu früh: die Kante verschmiert. |
| 3 | 5.6–8.2 | **B-roll** detail: old tape on hard paint; the paint film tears | (VO) «Zu spät – und die Farbe reisst mit.» | Zu spät: die Farbe reisst mit. |
| 4 | 8.2–12.4 | **Detail** macro: touch-dry paint, the tape pulled slowly at about 45°; a crisp line | (VO) «Richtig: sobald die Farbe angetrocknet ist. Langsam, im Winkel von etwa 45 Grad.» | Angetrocknet · langsam · ca. 45° |
| 5 | 12.4–15.0 | **A-roll**: finger near the crisp edge, eye contact, small smile | «Saubere Kante.» | Saubere Kante. |

- **Small notes:** «KI-generiert» for the whole video; «Herstellerangaben beachten» in shots 4–5; «AMS Malergeschäft · Tipps vom Profi» in the last 2 s.
- **Word count:** ~32 words, ≈ 13 s of speech; every subtitle has at least its reading time.

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

## 8. Budget and generation strategy (quotes from Higgsfield, 2026-10-22, nothing generated)
Balance: 1'130.59 credits (Ultra).

| Item | Model | Quote |
|---|---|---|
| Presenter identity image (face sheet), 9:16, 2k high | gpt_image_2_5 | 2.75 credits |
| Alternative UGC portrait | soul_2 | ~1 credit |
| Voice-over, full text, AMS custom voice («Ams-», reference element in the account) | text2speech_v2 / ElevenLabs | 0.75 credits |
| Same, Seed Audio | seed_audio | 1.5 credits |
| **Shot 1, 3 s**, image + voice → lip-synced video | **Wan 2.7, 720p** | **4.5 credits** |
| Shot 1, 3 s, 1080p | Wan 2.7 | 7.5 credits |
| Shot 1, 3 s, native audio (own voice; cannot take the AMS voice) | Kling 3.0 pro | 6 credits |
| Shot 1, minimum 4 s, best identity/reference control | Seedance 2.0, 720p / 1080p | 18 / 48 credits |

The video quotes were taken without media attached. The price with an image and audio reference must be re-checked right before submitting (same `get_cost` call).

**Recommended 3 s test (Gate 1):**
1. Identity image (2.75).
2. Line 1 with the AMS voice (≤ 0.75; the quote covered the full text).
3. Wan 2.7 3 s at 1080p with start image + audio reference (7.5).

**≈ 11 credits.** Optional comparison: the same shot with Seedance 2.0 720p at 4 s (+18).

**Full 15 s afterwards (estimate, before retakes):** ≈ 35–40 credits; with one retake per shot ≈ 75.
