# AMS OS — Phase 0 findings + Phase 1 change report (NOT deployed)

Branch: `feature/crm-attribution` in a local clone of `Madbird2236/ams-os` (commit b6ea319, based on main f8bafe2).
**Not pushed, not deployed, no migration applied, production DB not modified.** The full change is saved as
`proposals/ams-os/0001-feat-crm-campaign-attribution-lead-dedupe-on-intake-.patch` (apply with `git am`).

## Phase 0 — findings (read-only, counts only)
| Topic | Finding | Consequence |
|---|---|---|
| Offers module | Exists and is complete (positions, total, status draft/sent/accepted/rejected, PDF, Jarvis tools `create_offer`/`update_offer_status`). **0 offers ever created.** Offers were made in Bexio and synced as projects (31 projects in stage «lead», `offers.bexio_offer_id`). | Since Bexio is discontinued, offers are currently **not recorded in any system we can see**. To confirm with Adriano: where are offers written today? |
| Offer before approved project | An offer must belong to a project (`offers.project_id` NOT NULL). But a project in AMS OS has commercial stages **lead → analysis → offer → negotiation** before **confirmed → execution → invoicing → completed**. | ✅ Offers can be made **before** a project is approved: the project row in stage lead/offer IS the opportunity — it is not an operational project until «confirmed». No new table, no third system. Required fields for such a row: name, client name, location, country, type. |
| Two funnels | `crm_leads` (contacts: new→…→won/lost) and `projects` (opportunities/projects). | Keep both, link them: contact = `crm_leads`, opportunity → contract = `projects` (+ offers, invoices). Phase 1 adds the link `projects.lead_id`. |
| Old leads | 173 sales leads in «new» (excl. operational): 13 ≤7 d, 44 8–30 d, 97 31–90 d, 19 >90 d. **0 have an owner.** AI type: private 23, business 5, property manager 4, GC 4, architect 1, other 78, unclassified 58. | No mass change. Proposal: Jarvis produces a review list (oldest first, «other/unclassified» first = likely suppliers/newsletters), Adriano decides per batch. Nothing marked lost automatically. |
| Invoices | 39 (31 imported from Bexio, 8 AMS); 7 linked to a project; 0 to an offer. | Funnel value only measurable for new opportunities going forward. |

### Phase 0 operating rules (approved as procedure)
1. Every new lead gets **owner** (`assigned_to`), **stage** and **next step + due date** (new columns in 082) within 48 h (B2C) / 5 working days (B2B).
2. When a lead needs an offer → create an opportunity (project in stage «lead»/«offer») **linked to the lead**, write the offer in AMS OS on that project.
3. Offer accepted → project «confirmed» (= contract) → invoices on the project.
4. Old «new» leads: reviewed in batches with Jarvis' list; only Adriano changes their stage.

## Phase 1 — what changed (branch only)
| File | Change |
|---|---|
| `supabase/migrations/082_crm_attribution.sql` | Additive: `crm_leads` + segment (b2c/b2b), utm_source/medium/campaign/content/term, campaign_id, click_id, landing_page, next_step, next_step_due (all nullable, CHECKed). `projects.lead_id` → crm_leads ON DELETE SET NULL. View `crm_campaign_funnel` (security_invoker, per org: leads → worked → won → projects → offers → accepted CHF → invoiced → paid). |
| `supabase/rollbacks/082_crm_attribution_down.sql` | Drops exactly what 082 adds. |
| `src/lib/crm/attribution.ts` | Sanitises UTM/campaign/segment/click-id/landing page (length caps, safe charset, same-site path only). Invalid values dropped, never blocking a lead. |
| `src/lib/crm/lead-upsert.ts` | **Dedupe**: e-mail (unique per org) then phone (normalised like the DB). Existing lead → only empty fields filled; name/notes/stage never overwritten; attribution first-touch. Unique-race recovery. Every query scoped by org_id. |
| `src/app/api/lead-intake/route.ts` | Uses upsert. **Fixes a live bug:** a repeated e-mail currently fails on the unique index → HTTP 500 → enquiry not stored as lead. Accepts source `whatsapp` + attribution fields. |
| `src/lib/salesbot/email-poll.ts` | FormSubmit website forms → `source = website` (was «email»); hidden form fields (utm_*, campaign_id, segment) parsed into columns and removed from the enquiry text. Repeat form contact → first-touch attribution filled only if empty. Non-form mail unchanged byte-for-byte. |
| `.env.example` | `CRM_ATTRIBUTION_ENABLED=0` — attribution columns are written **only when =1**, i.e. after 082 is applied. Code can be deployed before the migration without breaking intake. |

Not changed: Jarvis tools, `/api/internal/crm-summary`, offers/projects/invoices code, RLS policies, Bexio sync script, any existing data.

## Tests (run locally)
| Suite | Result |
|---|---|
| Vitest, whole repo | **100 / 100 passed** (70 existing + 30 new) |
| New: attribution (8), lead upsert (10: new, repeat e-mail, fill-empty, phone match, tenant isolation, race, DB failure, flag off), route integration (9: no secret 503, wrong secret 401, bad JSON 400, no name 400, unknown org 404, new lead + attribution, repeat → same lead, whatsapp/unknown source, DB failure 500, hostile values), form parsing (3) | all passed |
| TypeScript `tsc --noEmit` | 0 errors |
| ESLint on changed files | clean |
| Migration 082 on PGlite (Postgres) replica of the relevant tables | applied ✓ · idempotent ✓ · historical rows unchanged ✓ · no backfill ✓ · legacy bot project insert ✓ · CHECKs ✓ · funnel view correct, no double counting ✓ · deleting a lead keeps the project ✓ · rollback removes exactly 082 ✓ · historical data intact after rollback ✓ |
Note: `npm ci` could not fetch `xlsx` from cdn.sheetjs.com (blocked here); tests ran with the npm-registry `xlsx` 0.18.5 **temporarily** — not committed, package files unchanged.

## Risks
| Risk | Mitigation |
|---|---|
| Code deployed before migration | Feature flag off by default → no new columns written. |
| Migration on production locks | Only `ADD COLUMN` nullable (metadata-only in PG 17), 2 partial indexes on small tables (≈360 leads, 53 projects), 1 view. Seconds. |
| Repeat contact now attached to an existing lead | Intended (no duplicates). Name/notes/stage never overwritten; new message still stored in a conversation. |
| Phone dedupe across formats (+41 79… vs 079…) | Not merged today (same as DB normalisation). Follow-up: E.164 normalisation. |
| `ams_bot_writer` / Bexio sync | Only nullable column added to `projects`; tested legacy insert. (Bexio sync is discontinued anyway.) |
| Website still has no UTM capture | Attribution only arrives once the website sends hidden fields (Phase 2). |

## Deployment plan (each step needs Adriano's explicit OK)
1. Review the patch → push branch → Vercel **preview** build.
2. Apply 082 in production (Supabase), run `get_advisors`.
3. Merge to main (prod deploy) with flag still 0 → verify intake + e-mail polling.
4. Set `CRM_ATTRIBUTION_ENABLED=1` in Vercel → redeploy → test with one tagged test lead.

## Rollback
- Fast: set `CRM_ATTRIBUTION_ENABLED=0` (attribution stops, dedupe fix stays).
- Code: Vercel «Promote» the previous production deployment (or revert the merge commit).
- Schema: run `supabase/rollbacks/082_crm_attribution_down.sql` (drops only 082 objects; values written into the new columns are lost — export first).

## Next (Phase 1b, after approval)
- Action «Lead → Opportunity» (creates project in stage «lead» with `lead_id`) in CRM UI + Jarvis tool param `lead_id`.
- Jarvis daily list: stale leads + leads without owner/next step, by campaign.
