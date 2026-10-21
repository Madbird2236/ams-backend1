# Lead capture & tracking — proposal (uses existing systems only)

Checked 2026-10-21, read-only. Nothing changed in any system.

## What exists today (verified)
| Element | Status | Evidence |
|---|---|---|
| Website www.ams-malergeschaeft.ch (Next.js on Vercel, project `ams-malergeschaeft`) | Live | Live HTML + Vercel deployment |
| Contact form (homepage `#contact`, `/kontakt/`) | Live. Fields: name, email, telefon, objekt, quelle («Gefunden über»), message + page + referrer | Site JS |
| Form delivery | 1) e-mail via FormSubmit to the site address; 2) POST to the site's own `/api/lead/` | Site JS |
| WhatsApp | `wa.me/41797935090` with prefilled text «Hallo AMS, ich möchte eine Offerte …» | Site HTML |
| Phone / e-mail | +41 79 793 50 90 · info@maler-ams.ch | Site HTML |
| Social | Instagram @amsmalergeschaft · LinkedIn /company/ams-gmbh · TikTok @amsmalergeschaftgmbh | Site HTML |
| **AMS OS CRM** (repo `ams-os`, Supabase «Ams OS») | Live. Leads with stages new → contacted → offer → negotiation → won / lost, `value_chf`, conversations, SalesBot, approvals, Jarvis agent, offers | Code + DB |
| AMS OS public intake `/api/lead-intake` | Live, secured by shared secret; sources website / phone / telegram; brand `maler` (B2C) or `ams-swiss` (B2B) | Code |
| AMS OS channels | 5 e-mail mailboxes connected; **WhatsApp supported in the schema but not connected (0 accounts)** | DB (counts only) |
| Analytics / ad tracking on the website | **None found** (no GTM, GA4, Google Ads tag, Meta pixel, LinkedIn tag) — although the Google Ads skill lists GTM-MJX2Z2PX | Site HTML + JS |
| Bexio | Discontinued — not used | Adriano |

## Problems found (must fix before spending on ads)
1. **No campaign tracking at all.** Leads carry no UTM / campaign field, and the site has no conversion tags. Today it is impossible to say which campaign produced which contract.
2. **Website → AMS OS looks weak or broken:** only 3 website-source leads in AMS OS, the last on 2026-07-22. Form leads may only arrive by e-mail (then counted as «email»). Needs verification by whoever maintains the site (the `/api/lead/` code is compiled; env vars not readable with my access).
3. **Pipeline not maintained:** 348 leads sit in stage «new» (179 flagged operational, 99 created in the last 30 days); only 4 won and 1 offer recorded. If stages aren't updated, campaign → offer → contract tracking cannot work, whatever the ads do.
4. **WhatsApp leads are invisible to AMS OS** (wa.me link only).
5. **Promise conflict — resolved:** official B2C promise is 24 h as on the website (werktags, nach der Besichtigung); campaigns aligned. B2B: no time promise.
6. No B2B-specific form.

## Proposed flows (no new tools — extend the website and AMS OS)
### B2C — fast contact
Ad (UTM link) → landing section on the existing website → **WhatsApp** (prefilled text including a campaign code, e.g. «… Offerte [WINTER-UM]») **or** existing form → AMS OS lead (brand `maler`, source website/whatsapp) → Jarvis/SalesBot prepares reply and offer within 48 h → stages updated to offer → won/lost + `value_chf`.

### B2B — project form
Ad / LinkedIn post (UTM) → new section «Projektanfrage Gewerbe & Retail» on the existing `/malerarbeiten-gewerbe/` page → fields: company, contact, role, project type (Retail fit-out / Rollout / Büro / Renovation), locations & number of sites, opening/handover date, budget range (optional), plans available (yes/no), message → same AMS OS `/api/lead-intake` with brand `ams-swiss` → assigned to sales (no auto-reply), CTA follow-up «Projektbesprechung / Rollout-Gespräch».

## Changes needed (for approval — I have not made any)
| # | Where | Change | Effort |
|---|---|---|---|
| 1 | Website | Capture `utm_source/medium/campaign` + `gclid`/`fbclid` on landing, keep in session, send with the form | small |
| 2 | Website | Verify `/api/lead/` → AMS OS `/api/lead-intake` works; fix if not | small |
| 3 | AMS OS | Add columns to `crm_leads`: `segment` (B2C/B2B), `utm_source`, `utm_medium`, `utm_campaign`, `campaign_id`, `click_id`; accept them in `/api/lead-intake`; source value `whatsapp` | small–medium (DB migration) |
| 4 | AMS OS | Campaign report: leads → offers → won → CHF per `campaign_id` (feeds `marketing/campanhas-registo.xlsx`) | medium |
| 5 | Website | Install tags only for channels we actually use (Meta pixel for B2C ads; LinkedIn Insight for B2B; Google tag if Google Ads runs), with consent banner (Swiss revDSG) | small |
| 6 | Website | B2B form section on `/malerarbeiten-gewerbe/` | small |
| 7 | WhatsApp | Phase 1: campaign code in prefilled text + manual entry in AMS OS. Phase 2 (later, cost): WhatsApp Business API connected to AMS OS (schema already supports it) | 1: none · 2: medium |
| 8 | Process | Weekly pipeline hygiene: every lead moved out of «new» within 24 h (B2C) / 5 working days (B2B) | discipline |

Who implements: the AMS OS / website codebases — on your instruction, in a separate change with review. Julia does not modify production systems without approval.
