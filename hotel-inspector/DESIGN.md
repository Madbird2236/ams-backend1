# AMS Hotel Inspector — DESIGN.md

Mode: **Operate** (a field tool used one-handed on a phone, often in poor light, hundreds of taps per inspection).
The interface disappears into the task; the brand lives in precise details, not in chrome.

## Decisions

| Axis | Decision | Why |
|---|---|---|
| Face | Schibsted Grotesk Variable (self-hosted, latin + latin-ext), one family | Neo-grotesk with character and real tabular figures; covers PT/DE/IT/EN accents offline |
| Scale | 12 / 13 / 14 / 15 / 16 / 17 / 24 px, line-height 16–20–24–28 | Fixed rem scale, 1.125–1.2 steps; nothing at display size inside the app |
| Weights | 400 body and figures, 500 row titles, 600 headings and totals | Three weights; 700 never |
| Ground / surface | `#f6f6f4` stone ground, white panels | Warm low-chroma stone from plaster and render, the trade's own material |
| Separation | 1px borders (`#e4e4df`) and 1px rules (`#eeeeea`); no shadows on cards | Border *or* tone step, never both; shadows only on what floats (update toast) |
| Radius | 8 card · 6 control · 4 chip | Tight family, chosen once |
| Primary | `#15202f` AMS navy as the near-black filled button | One filled primary per screen |
| Accent | `#a98a52` AMS gold, on data only (progress tracks, suggestion hint) | ≈3% of pixels; never on chrome |
| Status | pale tint + dark same-hue text (positive / warning / negative / info) | Saturated fill (`#c4242a`, white text) is reserved for **P0**, the one alarm |
| Text | ink `#141414`, muted `#5c5f5a`, faint `#6b6b6b` | Every tier ≥ 4.5:1 on ground and surface |
| Motion | press feedback `transform 160ms cubic-bezier(.23,1,.32,1)`, `scale(.97)`; hover only on `(hover:hover) and (pointer:fine)`; reduced-motion honoured | No entrances, no choreography; motion is feedback |
| Icons | Phosphor, regular weight (1.5px), 16–22px, grey | One drawn set; no emoji |
| Numbers | `font-variant-numeric: tabular-nums`, right-aligned in totals | Figures line up digit for digit |
| Copy | Sentence case everywhere; no eyebrows, no uppercase tracked labels | Labels 13px grey above the control |

## Components

- **Top bar** on the ground with a 1px rule; 44px back target; title 17/600, subline 12 grey.
- **Tabs**: ink label + 2px rule under the active one.
- **Rows** (`.row`): 56px minimum pitch, 1px rules between, chevron at the right, pressable.
- **Choice buttons** (`.choice`): 48px, white with control border; selected = tint + same-hue text + 1.5px ring. P0 selected = alarm fill.
- **Pills**: 20px tall, 12px/500, pale tint; never squeezed (`shrink-0`, `nowrap`).
- **KPI strip**: one panel split by hairlines, label 13 grey over value 24/400 in ink; red only when the number is bad.
- **Track**: 2px grey track, gold fill; the only place the accent appears as area.
- **Empty states** keep the frame: dashed 1px box with one sentence and the first action.

## PDF (Read mode)

Cover keeps the navy field (a document cover is a committed moment). Inside: Helvetica, 8–9.5pt body, tables with a grey 8pt header and a 0.5pt ink rule, no zebra striping, no header band; priority cells in pale tints with dark text, P0 in alarm red; photos at 8px radius in a 4:3 frame.

## Banned here

Emoji as icons · uppercase tracked labels · cards with border + shadow · gradient text · coloured left bars · KPI tiles with icons in circles · zebra tables · `transition: all` · `ease-in` on UI · `scale(0)` entrances · dark sidebar on a light canvas.
