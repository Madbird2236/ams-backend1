# UGC reference 01 — AI drywall presenter (analysis, 2026-10-22)

- **File:** `reference.mp4` (copy of Adriano's upload). The filename prefix `hf_` suggests it was generated in Higgsfield.
- **Specs:** 15.07 s, 720×1280 (9:16), 24 fps, AAC 32 kHz stereo, −18.6 LUFS.
- **Analysis method:**
  - scene detection (ffmpeg), a frame every 0.5 s, spectrogram and an energy curve;
  - continuity frames.
- **Limit:** speech recognition is not available here (Whisper/Vosk models sit on blocked hosts) and Julia cannot listen to audio. Where the voice sits was measured; what is said was not transcribed.

## Shot structure (cuts at 2.63 / 5.67 / 8.21 / 10.88 s)
| # | Time | Shot | Function | Speech |
|---|---|---|---|---|
| 1 | 0–2.6 | Wide, static, slight wide-angle distortion: presenter far back in a metal-stud wall, insulation rolls in the foreground | Establish place and trade; hook | Yes (to camera) |
| 2 | 2.6–5.7 | Medium profile: he fits mineral wool between the studs | Show the work | Partly (VO over the work) |
| 3 | 5.7–8.2 | Over-the-shoulder close | Hands and material detail | Little; rustling of the wool |
| 4 | 8.2–10.9 | Insert: knife cutting the insulation roll on the floor | Technical close-up, satisfying sound | Knife-sawing noise dominates |
| 5 | 10.9–15 | Medium: he holds a gypsum board, turns to camera and talks | Direct address and payoff | Yes (lip-sync visible) |

Average shot length is about 3 s. The alternation is direct talk → work → detail → work → direct talk.

## Findings
1. **Naturalness:**
   - Posture, handling of the material and the turn to camera are believable.
   - A small realism cue: a lavalier mic clipped to the shirt.
   - The expression in shot 5 is a little exaggerated (open «O» mouth).
2. **Lip-sync and voice:**
   - Lips are only visible in shots 1 and 5; in between the voice runs over the work. This is the classic UGC structure, and it also hides lip-sync risk.
   - Sync quality could only be judged visually.
3. **Identity continuity:**
   - Consistent: face, beard, skin and white workwear with black knee panels.
   - **Continuity error:** in shot 3 (back of the head) the hair is short with no bun; in shots 1 and 5 he has a large bun. Saved in `continuity-hair.jpg`.
4. **Camera and light:**
   - Vertical, smartphone-like.
   - Shot 1 is static and wide; the others have slight handheld movement.
   - Soft, flat daylight from the window, no cinematic grading. Credible.
5. **Process logic:** the insulation is cut (shot 4) **after** it is fitted (shots 2–3). The order of the craft is inverted. A professional viewer notices this, and it costs credibility.
6. **Edit rhythm and audio:**
   - Room reverb fits the empty room.
   - The work sounds are in sync with the action: rustling at 2.6–4.2 s, knife at 8.2–10.6 s.
   - Loudness is low for social (−18.6 vs −14 LUFS).
7. **Text:** none. Most feed views start muted, so the message is lost without discreet subtitles.

## What makes UGC work (lessons)
- It must feel **recorded, not produced**: phone framing, natural light, real room tone, small imperfections, a person talking *to* you.
- One person, one tip, one proof shot. The value is the tip, not the effects.
- Hide the hardest AI tasks (lip-sync, hands) in B-roll; show the face only where the message needs eye contact.
- Credibility comes from **correct craft logic**. A wrong process order destroys it faster than any visual glitch.

## Re-evaluation 2026-10-22 (after the failed test shot)
New facts from Adriano's Higgsfield library (job c5065e57):
- **Model:** Seedance 2.5, one single 15 s generation, 720p, native audio. Not stitched shots.
- **The presenter is a character element named «Adriano dos Santos»**, built from Adriano's photo: a digital twin of the owner, not a fictional actor.
- **Speech (transcribed):**
  - «Why can you hear your neighbours through a new wall?»
  - «No insulation inside, and the wall works like a drum.»
  - «Full insulation and double boards, and the room goes quiet.»
  - English with a light accent.
- **Prompt logic:** «realistic smartphone-shot UGC with multiple camera angles, true-to-life, not a movie»; 5 shots described one by one: wide → side close-up → over-the-shoulder → top-down hands → low-angle turn to camera. Natural daylight, light handheld, normal speed, room tone, **no text in frame**.

### Why it works (and my test did not)
| Reference | My test shot 1 |
|---|---|
| Opens on a **lived problem as a question** («why can you hear your neighbours?») | Opened with a generic listicle line («Häufigster Fehler …») |
| Opens **wide in the real situation**; the man is small, the room tells the story | Opened centred, chest-up, posed: a presenter, not a worker |
| He **works** the whole time; he talks while doing; he turns to camera only for the payoff | He held the tape roll like a product and talked into the lens |
| A **sensory metaphor** explains the cause («the wall works like a drum») | Plain instruction |
| The payoff is a **feeling** («the room goes quiet») | The payoff was a rule |
| 5 angles = a colleague filming = credible | One frontal angle = an ad |
| **One generation** gives one light, one room, one sound world | An image → video pipeline per shot gives stiff, separate pieces |
| A **real person** (the owner's twin) | A generic stock-looking «Swiss painter», with a postcard window and a flag |

Still valid from the first analysis: the hair continuity error (shot 3), the inverted craft order (cut after fitting) and no subtitles.
