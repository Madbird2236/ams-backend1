# Audit — lead capture & commercial journey in AMS OS (read-only, 2026-10-21)

Method: live website HTML/JS, Vercel deployment metadata, AMS OS source code (repo `ams-os`, commit f8bafe2), AMS OS database (Supabase «Ams OS») — **aggregate counts only, no personal data read, nothing modified.**

## Summary
| # | Question | Verdict |
|---|---|---|
| 1 | Website form → AMS OS | ✅ **Works via e-mail.** Partial: wrong source label, website API path inactive since July |
| 2 | E-mail / WhatsApp → CRM (Jarvis) | ✅ E-mail works (5 mailboxes). ❌ WhatsApp not connected |
| 3 | Origin: campaigns, UTMs, channels | ❌ **Not recorded** (no UTM/campaign fields, no tags on the site) |
| 4 | Contact → opportunity → offer → contract → invoice | ⚠️ **Broken after the lead.** 0 offers in AMS OS, leads not linked to projects/invoices |
| 5 | B2C vs B2B + requested service | ✅ Mostly — AI profile classifies customer type and service |

## 1. Website form → AMS OS
- Form posts to FormSubmit → e-mail to **info@maler-ams.ch**; a mailbox rule files it in **Forms**.
- AMS OS polls info@maler-ams.ch on **INBOX + Forms** (`crm_channel_accounts.imap_folders`), recognises FormSubmit mails and extracts the real customer e-mail, name and enquiry (`parseFormSubmitLead`).
- Evidence: 13 form enquiries in AMS OS, **5 in the last 30 days, latest 2026-10-19** → working.
- Incomplete:
  - These leads are stored with `source = email`, not `website` → form leads can't be told apart from ordinary e-mails in reports.
  - The second path (site `/api/lead/` → AMS OS `/api/lead-intake`) has produced only 3 leads, last on 2026-07-22 → appears inactive. Not harmful today (e-mail path works), but it is the only path that could carry UTMs cleanly.
  - Risk of duplicates if both paths work at the same time (dedup on normalised e-mail exists; to verify).

## 2. E-mail and WhatsApp
- E-mail: 5 active mailboxes (info@maler-ams.ch brand «maler»; info@, adriano@, finance@, invoice@ ams.swiss brand «ams-swiss»). 1'117 e-mail conversations ingested; SalesBot analyses them and drafts replies; approvals before sending.
- Jarvis: reads the funnel (`/api/internal/crm-summary`: leads by stage, stale leads > 7 days) and, in the app agent, can list leads, create projects, **create offers**, invoices, tasks, send client e-mails (with approvals).
- **WhatsApp: not connected.** Schema supports it (`channel = whatsapp`), 0 accounts. Website WhatsApp button (wa.me/41797935090) → conversations stay on the phone, invisible to AMS OS and Jarvis.

## 3. Origin tracking
- `crm_leads.source` only allows website / phone / telegram / manual (+ email in practice). **No utm_source, utm_campaign, campaign, click-id fields** anywhere.
- The website captures page + referrer only; **no GTM / GA4 / Google Ads / Meta / LinkedIn tags installed** (the Google Ads skill lists GTM-MJX2Z2PX, but it is not on the live site).
- Consequence: today no campaign can be connected to a lead, an offer or a contract.

## 4. Commercial journey
| Step | AMS OS today |
|---|---|
| Contact / lead | ✅ 359 leads (stages new → contacted → offer → negotiation → won/lost) |
| Pipeline maintenance | ❌ 348 leads still «new» (179 flagged operational); 99 new in last 30 days; only 4 «won», 1 «offer» |
| Value | ❌ `value_chf` empty on all leads |
| Offer | ❌ **0 offers in AMS OS** (offers are made elsewhere) — and `offers` has no `lead_id` |
| Project / contract | ⚠️ 53 projects, linked to the client by name/e-mail text, not to the lead |
| Invoice | ⚠️ 39 invoices; 7 linked to a project, 0 to an offer |
→ The chain breaks right after the lead. Marketing ROI cannot be measured until offers live in AMS OS and are linked to the lead.

## 5. B2C / B2B and services
- `crm_lead_profiles` (SalesBot AI): customer_type for 148/203 profiles — private, business, architect, property_manager, general_contractor, other → maps cleanly to B2C/B2B.
- service_type for 57/203 (free text, e.g. «Innere Malerarbeiten», «Retail fit-out / Ladenbau»). Free text → hard to report; a fixed service list is needed.
- Conversations also carry brand «maler» (B2C site) / «ams-swiss» (B2B).

## Fixes — diagnosis and solution (nothing applied; needs authorisation)
| Priority | Problem | Solution (existing systems only) |
|---|---|---|
| P1 | Offers not in AMS OS | Create every offer in AMS OS (Jarvis `create_offer` already exists); add `lead_id` to `offers` so offer ↔ lead is linked |
| P1 | Pipeline not maintained | Rule: every lead leaves «new» within 24 h (B2C) / 5 working days (B2B); Jarvis daily list of stale leads (endpoint already exists) |
| P1 | No origin tracking | Website: capture UTM + gclid/fbclid, add them as hidden fields to the FormSubmit mail; AMS OS parser reads them → new lead columns `utm_source`, `utm_medium`, `utm_campaign`, `campaign_id`, `segment` |
| P2 | Form leads labelled «email» | Parser sets `source = website` when the mail is a FormSubmit submission |
| P2 | WhatsApp invisible | Phase 1: campaign code in the prefilled WhatsApp text + one-tap «lead from WhatsApp» in AMS OS/Jarvis. Phase 2: WhatsApp Business API into AMS OS (schema ready; external cost) |
| P2 | Service as free text | Fixed service list (Innenmalerei, Fassade, Gipser/Verputz, Tapezieren, Schimmel, Wohnungsabgabe, Retail fit-out, Rollout, Unterhalt, Andere) in the AI profile |
| P3 | Value missing | Lead `value_chf` = offer total automatically once offers are linked |
| P3 | Dead website→API path | Either fix `/api/lead/` → `/api/lead-intake` (then disable e-mail path for forms to avoid duplicates) or remove it — one path only |
| P3 | No ad tags | Install only for channels used, with consent banner (revDSG) |
