# Calibration 01 — Retroactive test (2026-10-21)

Method: the pre-flight check (`creative/CREATIVE-COMPETENCIES.md`) applied to the **as-delivered** versions from git history and the rendered files, before re-reading later corrections.
Limitation: Julia already knew most of the corrections, so "caught" for known errors is weak evidence. The **new findings** (errors nobody had flagged) are the real test.

## Corpus (15 pieces)
Snowman ad · Post box (rejected) · Tracing paper (rejected) · Camping queue · Conductor single ad · Cake · Conductor carousel v1 (5) · Conductor carousel v2-final (5) · Reel scripts A/B/C · Sinfonie Reel · 19/10 direct series (5).

## A. Known errors: would the check catch them?
| # | Error (first caught by) | Check point | Caught? |
|---|---|---|---|
| 1 | «Offerte innert 48 Stunden» in B2B: carousel v1 + v2 slide 5, Sinfonie end card (Adriano) | 3 Claims | Yes |
| 2 | «Sieben Gewerke», «Elektriker», «Alle Gewerke» (Julia, in v2 doc) | 3 Claims (scope) | Yes |
| 3 | British red post box (Adriano) | 4 Culture | Yes |
| 4 | «dauerhaft sauber» (Julia, last turn) | 3 Claims (guarantee words) | Yes |
| 5 | Unofficial logo in the 19/10 ads (Julia, last turn) | 6 Brand | Yes |
| 6 | Logo on the CTA, dark text on dark sleeve, plate over the title (Adriano) | 5 Composition plan | Only if the logo zone is planned before composing |
| 7 | Rule banning direct ads (Julia's overcorrection) | none | **No**: it is an error in rule-writing, not in a piece |
| 8 | Cake does not match the child's drawing (Adriano) | none before credits | **No**: execution fidelity is only visible after generation |
| 9 | Post box and tracing paper not surprising enough (Adriano) | 2 Idea | Partly: Julia had scored them Surprise 4 and 3 and still presented them |

Result: 5 of 9 caught clearly, 2 partly, 2 missed. The check is good on claims, culture and brand; weak on judgement, post-generation fidelity and the rules themselves.

## B. New findings (nobody had flagged them)
| # | Piece | Finding | Severity |
|---|---|---|---|
| N1 | Camping queue | «Wir übergeben Ihre Filiale am geplanten Tag.» is an absolute on-time promise in B2B, with no proof attached | High (contract risk) |
| N2 | Conductor ad + carousel | «Auf den Takt genau» is the same promise as a metaphor. Acceptable only with proof nearby (references, on-time record) or in a softer frame. The post box brief already named this risk, but it was never applied to the conductor. | Medium |
| N3 | Carousel v2 slide 4 | The storyboard asked for an **unfinished store at night**; the image shows a finished, bright store. The «before opening» tension is lost, so the key handover on slide 5 lands softer. Storyboard drift was not checked. | Medium (narrative) |
| N4 | Cake ad | «für Familien, Architekten und Marken» speaks to everyone and therefore to no one. Clarity was self-scored 5; realistically 3. | Medium |
| N5 | Self-scores (first three concepts) | Julia scored Clarity 4–5 and Premium 4–5 on all three; Adriano approved one. Systematic optimism of about 1 point. | High (judgement) |
| N6 | 19/10 series | Fassade sold in winter (cannot be executed until spring). Kicker «AMS MALERGESCHÄFT · ZÜRICH» repeats the logo directly above it. «Fassade · Wohnung · Gipser» mixes objects and a trade. | Medium / low / low |
| N7 | Carousel v2 slides 1–2 | Sublines are 34 px on 1080 wide, small for a phone feed next to 100+ px headlines | Low |
| — | Carousel v2 slide 4 subline | Suspected low contrast; **measured** ≈ 5:1 on average, passes. A visual impression was wrong; measurement corrected it. | No error |

## C. Changes to the check (applied in CREATIVE-COMPETENCIES.md)
1. **Promise words list** extended: am geplanten Tag, termingerecht, pünktlich, auf den Takt genau, garantiert, dauerhaft, immer, alle, jede. Each needs a proof source or a softer frame; in B2B always.
2. **Self-score discipline:** subtract the known optimism (about 1 point) or justify every 5 with a comparison to an approved reference. Only concepts with Surprise ≥ 4 *and* Clarity ≥ 4 lead a presentation.
3. **Storyboard fidelity** after generation: each frame checked against its function in the storyboard (setting, time of day, state of the space).
4. **Mobile legibility:** sublines ≥ 40 px on 1080 wide; contrast measured, not judged by eye.
5. **Redundancy:** the brand name appears once per layout (logo *or* kicker).
6. **Rule check (meta):** before writing any new rule, test it against the approved references. A rule that would forbid an approved piece is wrong.
