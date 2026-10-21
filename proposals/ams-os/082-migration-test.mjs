import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
const db = new PGlite();
const up = readFileSync("/home/user/ams-os/supabase/migrations/082_crm_attribution.sql", "utf8");
const down = readFileSync("/home/user/ams-os/supabase/rollbacks/082_crm_attribution_down.sql", "utf8");
// Replica of the production shape relevant to 082 (columns/types/constraints as queried).
await db.exec(`
CREATE ROLE anon; CREATE ROLE authenticated;
CREATE TYPE project_stage AS ENUM ('lead','analysis','offer','negotiation','confirmed','execution','invoicing','completed');
CREATE TYPE offer_status AS ENUM ('draft','sent','accepted','rejected');
CREATE TABLE crm_leads (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL, stage text NOT NULL DEFAULT 'new'
  CHECK (stage IN ('new','contacted','offer','negotiation','won','lost')), name text NOT NULL, phone text, email text, company text,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('website','phone','telegram','manual','email','whatsapp')), notes text,
  value_chf numeric(12,2), assigned_to uuid, position int, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  email_normalized text GENERATED ALWAYS AS (NULLIF(lower(btrim(email)),'')) STORED,
  phone_normalized text GENERATED ALWAYS AS (NULLIF(regexp_replace(phone,'[^0-9+]','','g'),'')) STORED, is_ops boolean NOT NULL DEFAULT false);
CREATE UNIQUE INDEX uq_crm_leads_org_email ON crm_leads (org_id, email_normalized) WHERE email_normalized IS NOT NULL;
CREATE TABLE projects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL, name text NOT NULL, client_name text NOT NULL,
  location text NOT NULL, country text NOT NULL, type_id uuid NOT NULL, stage project_stage NOT NULL DEFAULT 'lead', value_chf numeric NOT NULL DEFAULT 0,
  margin_percent numeric NOT NULL DEFAULT 15, created_by uuid NOT NULL, created_at timestamptz DEFAULT now());
CREATE TABLE offers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid, project_id uuid NOT NULL REFERENCES projects(id), total_chf numeric, status offer_status DEFAULT 'draft');
CREATE TABLE invoices (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid, project_id uuid REFERENCES projects(id), total_chf numeric, paid_chf numeric, cancelled_at timestamptz);
`);
const O = "11111111-1111-1111-1111-111111111111", T = "22222222-2222-2222-2222-222222222222", U = "33333333-3333-3333-3333-333333333333";
// Historical data BEFORE the migration
await db.exec(`
INSERT INTO crm_leads (id, org_id, name, email, source, stage) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','${O}','Alt Kunde','alt@example.ch','email','won');
INSERT INTO projects (id, org_id, name, client_name, location, country, type_id, created_by, stage) VALUES ('bbbbbbbb-0000-0000-0000-000000000001','${O}','Alt Projekt','Alt Kunde','Zürich','CH','${T}','${U}','completed');
INSERT INTO invoices (org_id, project_id, total_chf, paid_chf) VALUES ('${O}','bbbbbbbb-0000-0000-0000-000000000001', 5000, 5000);`);
const snap = async () => JSON.stringify((await db.query(`SELECT (SELECT json_agg(t ORDER BY id) FROM (SELECT id,org_id,name,email,source,stage FROM crm_leads) t) l,
  (SELECT json_agg(t) FROM (SELECT id,name,stage FROM projects) t) p, (SELECT json_agg(t) FROM (SELECT total_chf,paid_chf FROM invoices) t) i`)).rows);
const before = await snap();

await db.exec(up); console.log("✓ migration 082 applied");
await db.exec(up); console.log("✓ migration 082 re-run is idempotent");
const after = await snap();
console.log(before === after ? "✓ historical rows unchanged" : "✗ historical rows CHANGED");
const nulls = (await db.query(`SELECT count(*)::int n FROM crm_leads WHERE campaign_id IS NULL AND segment IS NULL`)).rows[0].n;
console.log(nulls === 1 ? "✓ existing lead has empty attribution (no backfill)" : "✗ unexpected backfill");

// Old-style project insert (bot contract: no lead_id) still works
await db.exec(`INSERT INTO projects (org_id, name, client_name, location, country, type_id, created_by) VALUES ('${O}','Bot Projekt','X','Bern','CH','${T}','${U}')`);
console.log("✓ legacy project insert without lead_id works (ams_bot_writer contract)");

// Constraints
for (const [label, sql] of [["segment check", `UPDATE crm_leads SET segment='vip'`], ["length check", `UPDATE crm_leads SET utm_source=repeat('a',121)`]]) {
  try { await db.exec(sql); console.log("✗ " + label + " not enforced"); } catch { console.log("✓ " + label + " enforced"); }
}

// Full funnel: lead (campaign) → opportunity/project → offer → accepted → invoice
await db.exec(`
INSERT INTO crm_leads (id, org_id, name, email, source, stage, campaign_id, segment, utm_source) VALUES ('aaaaaaaa-0000-0000-0000-000000000002','${O}','Neu','neu@example.ch','website','won','b2c-2026-01-untermieter','b2c','instagram');
INSERT INTO crm_leads (id, org_id, name, email, source, stage, campaign_id, segment) VALUES ('aaaaaaaa-0000-0000-0000-000000000003','${O}','Neu2','neu2@example.ch','website','new','b2c-2026-01-untermieter','b2c');
INSERT INTO projects (id, org_id, name, client_name, location, country, type_id, created_by, stage, lead_id) VALUES ('bbbbbbbb-0000-0000-0000-000000000002','${O}','Wohnung','Neu','Zürich','CH','${T}','${U}','offer','aaaaaaaa-0000-0000-0000-000000000002');
INSERT INTO offers (org_id, project_id, total_chf, status) VALUES ('${O}','bbbbbbbb-0000-0000-0000-000000000002', 4200, 'accepted'), ('${O}','bbbbbbbb-0000-0000-0000-000000000002', 4800, 'rejected');
INSERT INTO invoices (org_id, project_id, total_chf, paid_chf) VALUES ('${O}','bbbbbbbb-0000-0000-0000-000000000002', 2100, 2100), ('${O}','bbbbbbbb-0000-0000-0000-000000000002', 2100, 0);`);
const f = (await db.query(`SELECT * FROM crm_campaign_funnel WHERE campaign_id='b2c-2026-01-untermieter'`)).rows[0];
const ok = f.leads == 2 && f.leads_worked == 1 && f.leads_won == 1 && f.projects == 1 && f.offers == 2 && Number(f.offers_chf) == 9000 && f.offers_accepted == 1 && Number(f.accepted_chf) == 4200 && Number(f.invoiced_chf) == 4200 && Number(f.paid_chf) == 2100;
console.log(ok ? "✓ funnel view correct (no double counting): " : "✗ funnel view WRONG: ", JSON.stringify(f));

// ON DELETE SET NULL: deleting a lead never deletes a project
await db.exec(`DELETE FROM crm_leads WHERE id='aaaaaaaa-0000-0000-0000-000000000002'`);
const p = (await db.query(`SELECT lead_id FROM projects WHERE id='bbbbbbbb-0000-0000-0000-000000000002'`)).rows[0];
console.log(p && p.lead_id === null ? "✓ deleting a lead keeps the project (lead_id → NULL)" : "✗ FK behaviour wrong");

await db.exec(down); console.log("✓ rollback applied");
const cols = (await db.query(`SELECT count(*)::int n FROM information_schema.columns WHERE (table_name='crm_leads' AND column_name IN ('segment','campaign_id','utm_source','next_step')) OR (table_name='projects' AND column_name='lead_id')`)).rows[0].n;
const view = (await db.query(`SELECT count(*)::int n FROM information_schema.views WHERE table_name='crm_campaign_funnel'`)).rows[0].n;
console.log(cols === 0 && view === 0 ? "✓ rollback removed exactly what 082 added" : "✗ rollback incomplete");
const legacy = (await db.query(`SELECT count(*)::int n FROM crm_leads WHERE email='alt@example.ch' AND stage='won'`)).rows[0].n;
console.log(legacy === 1 ? "✓ historical lead intact after rollback" : "✗ historical lead lost");
