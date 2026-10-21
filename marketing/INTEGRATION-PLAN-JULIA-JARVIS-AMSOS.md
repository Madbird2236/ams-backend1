# Julia → Jarvis → AMS OS — integration plan (no second CRM)

**Julia attracts · Jarvis serves · AMS OS records and tracks.**

## Roles
| | Julia (marketing) | Jarvis (service) | AMS OS (system of record) |
|---|---|---|---|
| Does | Campaigns, creatives, UTM links, campaign register, weekly ROI report | Reads new leads, drafts replies, prepares offers (B2C ≤ 48 h), flags stale leads, updates stages with approval | Leads, conversations, offers, projects, invoices, all IDs |
| Writes to AMS OS | Nothing directly (reads reports only) | Only through existing tools + approvals | — |

## Data contract (the one ID that ties everything)
`campaign_id` (e.g. `b2c-2026-01-untermieter`) travels: ad URL (utm_campaign) → website → form mail / WhatsApp code → AMS OS lead → offer (lead_id) → project → invoice.

## Phases
| Phase | What | Who | Approval |
|---|---|---|---|
| 0 (now) | Process: offers created in AMS OS; pipeline cleaned and maintained | Adriano/team + Jarvis | Yes — process decision |
| 1 | AMS OS: lead columns (segment, utm_*, campaign_id), `offers.lead_id`, FormSubmit parser reads UTM fields and sets source=website, fixed service list | Code change in `ams-os` | Yes |
| 2 | Website: UTM capture → hidden form fields; WhatsApp prefilled campaign code; B2B form on `/malerarbeiten-gewerbe/` | Code change in website | Yes |
| 3 | Jarvis: daily «new leads + stale leads by campaign»; offer draft from lead; stage updates with approval | AMS OS agent tools (exist) + small endpoint | Yes |
| 4 | Julia: weekly campaign report from AMS OS (leads, offers, won, CHF per campaign_id) into `campanhas-registo.xlsx` | Read-only access to AMS OS reports | Yes |
| 5 | WhatsApp Business API → AMS OS | External cost | Yes |

## Order of value
Phase 0 + 1 first: without offers in AMS OS and a campaign field on leads, any ad spend is unmeasurable. Phase 2 the same week as the first campaign launch.
