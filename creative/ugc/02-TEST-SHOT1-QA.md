# UGC «Klebeband» — test shot 1 (2026-10-22)

**Spent:** 8.90 credits, measured on the balance (1'130.59 → 1'121.69). Approved budget: ≈ 11.

| Step | Model | Result |
|---|---|---|
| Identity image | gpt_image_2_5 (2.75) | Painter ~40, short hair, short beard, plain white workwear without logo, tape roll; Swiss apartment, crisp green/white edge. Realistic, UGC look |
| Voice line 1 | text2speech_v2 / ElevenLabs, AMS custom voice «Ams-» | Whisper check: German (p=1.00), every word correct. Raw 4.44 s with a 0.84 s pause; tightened to 3.8 s of speech |
| Video 4 s | Wan 2.7, 720p, start image + audio reference (6) | One continuous shot, 30 fps, 722×1276 |
| Preview | local post (sandbox): subtitles with a soft box, «KI-generiert» label, −14 LUFS | `https://d2ol7oe51mr4n9.cloudfront.net/user_30vgSUYtwrbLkwjxgBk2WrT5VCV/7c2f7943-73dc-4e61-8a98-22eefdcb35fd.mp4` |

Why 4 s and 720p:
- Even tightened, the line needs 3.8 s.
- 1080p at 4 s would have cost 10 credits, above the approved budget.
- 720p matches the reference video.

## QA
- **Voice in the video:** the transcript of the output matches the input voice word for word, with identical timestamps. The model used the AMS voice unchanged.
- **Lip-sync:**
  - The «b» in «beim» (1.34 s): lips close, then open ✓.
  - Vowels open at the right moments ✓.
  - **Weak:** at the end of «Klebeband» the mouth stays closed during «-and» (≈3.45–3.8 s); the last syllable is swallowed.
- **Identity:** the face, hair, beard, clothes and room stay stable for 4 s ✓.
- **Naturalness:**
  - Small head movements and eyebrows; he lifts the tape towards the lens at the end, which is a natural UGC gesture ✓.
  - The expression on the question is slightly theatrical.
- **Hands:** the close hand is plausible, with the thumb hidden behind the roll; skin looks a little waxy at close range.
- **First subtitle version failed:** white text on the white overalls was illegible. Fixed with a soft dark box (55 %).
- **Not yet tested:** B-roll hands pulling tape (shots 2–4) and identity continuity across cuts. The reference video failed on exactly that point.
