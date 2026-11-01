import { Link, useOutletContext } from 'react-router-dom'
import type { Assessment, Inspection } from '../types'
import { useT } from '../i18n'
import { Page } from '../components/Layout'
import { Section, KpiStrip, PriorityPill, ConditionPill, Track, Chevron } from '../components/ui'
import { analyze, sortByPriority } from '../lib/analysis'
import { categoryById } from '../data/checklist'
import { zoneLabel } from '../lib/model'

type Ctx = { insp: Inspection; assessments: Assessment[] }

export default function Summary() {
  const { insp, assessments } = useOutletContext<Ctx>()
  const { t } = useT()
  const an = analyze(insp, assessments, t)

  const linkFor = (a: Assessment) => `/i/${insp.id}/c/${a.categoryId}/z/${a.zoneId}/e/${a.elementId}`
  const label = (a: Assessment) => `${zoneLabel(insp, a.zoneId, t(`cat.${a.categoryId}`))} — ${t(`el.${a.elementId}`)}`

  const List = ({ items }: { items: Assessment[] }) =>
    items.length === 0 ? <div className="px-4 py-4 text-[14px] text-muted">{t('no_items')}</div> : (
      <ul className="divide-y divide-rule">
        {sortByPriority(items).map((a) => (
          <li key={a.id}>
            <Link to={linkFor(a)} className="row py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-medium">{label(a)}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <PriorityPill p={a.priority} />
                  <ConditionPill c={a.condition} />
                  {a.description && <span className="truncate text-[13px] text-muted">{a.description}</span>}
                </div>
              </div>
              <Chevron />
            </Link>
          </li>
        ))}
      </ul>
    )

  const conclStyle = {
    well_preserved: 'border-positive/40 bg-positive-bg text-positive-ink',
    partial: 'border-warning-border bg-warning-bg text-warning',
    deep: 'border-negative/40 bg-negative-bg text-negative-ink',
    insufficient: 'border-border bg-raised text-ink',
  }[an.conclusion.kind]

  return (
    <Page className="space-y-5">
      <KpiStrip items={[
        { label: t('coverage'), value: `${an.coveragePct}%` },
        { label: t('critical_issues'), value: an.critical.length, bad: an.critical.length > 0 },
        { label: t('required_works'), value: an.required.length },
        { label: t('pending_checks'), value: an.specialist.length + an.notVerified.length },
      ]} />

      <section>
        <h2 className="mb-2 px-0.5 text-[16px] font-semibold leading-6">{t('conclusion')}</h2>
        <div className={`rounded-[var(--radius-card)] border px-4 py-3 ${conclStyle}`}>
          <div className="text-[16px] font-semibold leading-6">{t(`concl.${an.conclusion.kind}`)}</div>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-[13px] leading-[18px]">{an.conclusion.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
        <p className="mt-2 px-0.5 text-[12px] leading-4 text-muted">{t('summary_disclaimer')}</p>
      </section>

      <Section title={t('overview_by_category')} flush>
        <ul className="divide-y divide-rule">
          {an.byCategory.map((c) => {
            const cat = categoryById(c.categoryId)!
            return (
              <li key={c.categoryId}>
                <Link to={`/i/${insp.id}/c/${c.categoryId}`} className="row py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[15px] font-medium">{cat.code}. {t(`cat.${c.categoryId}`)}</span>
                      <span className="num text-[13px] text-muted">{c.assessed}/{c.total}</span>
                    </div>
                    <Track value={c.assessed} max={c.total} className="mt-1.5" />
                    <div className="num mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] leading-4 text-muted">
                      <span>{t('rep_table_good')} <span className={c.good ? 'text-ink' : ''}>{c.good}</span></span>
                      <span>{t('rep_table_repair')} <span className={c.repair ? 'text-ink' : ''}>{c.repair}</span></span>
                      <span>{t('rep_table_replace')} <span className={c.replace ? 'text-negative' : ''}>{c.replace}</span></span>
                      <span>{t('rep_table_unverified')} <span className={c.unverified ? 'text-ink' : ''}>{c.unverified}</span></span>
                      {c.p0 > 0 && <span>P0 <span className="text-negative font-medium">{c.p0}</span></span>}
                    </div>
                  </div>
                  <Chevron />
                </Link>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title={t('critical_issues')} right={an.critical.length} flush><List items={an.critical} /></Section>
      <Section title={t('required_works')} right={an.required.filter((a) => a.priority !== 'P0').length} flush><List items={an.required.filter((a) => a.priority !== 'P0')} /></Section>
      <Section title={t('recommended_repairs')} right={an.recommended.length} flush><List items={an.recommended} /></Section>
      <Section title={t('can_remain')} right={an.canRemain.length} flush><List items={an.canRemain} /></Section>
      <Section title={t('optional_improvements')} right={an.optional.length} flush><List items={an.optional} /></Section>

      <Section title={t('pending_checks')} flush>
        <List items={[...new Map([...an.specialist, ...an.notVerified].map((a) => [a.id, a])).values()]} />
      </Section>

      <Section title={t('not_assessed_areas')} right={an.notAssessed.length}>
        {an.notAssessed.length === 0 ? <p className="text-[14px] text-muted">{t('no_items')}</p> : (
          <div className="flex flex-wrap gap-1.5">
            {an.notAssessed.slice(0, 60).map((s) => (
              <Link key={`${s.zoneId}|${s.elementId}`} to={`/i/${insp.id}/c/${s.categoryId}/z/${s.zoneId}/e/${s.elementId}`} className="press rounded-[var(--radius-chip)] bg-active px-2 min-h-7 inline-flex items-center text-[12px] text-ink">
                {categoryById(s.categoryId)?.code} · {t(`el.${s.elementId}`)}{(() => { const z = insp.zones.find((x) => x.id === s.zoneId); return z?.label ? ` (${z.label})` : '' })()}
              </Link>
            ))}
            {an.notAssessed.length > 60 && <span className="pill bg-active text-muted">+{an.notAssessed.length - 60}</span>}
          </div>
        )}
      </Section>

      <Section title={t('financial_risks')} right={an.risks.length}>
        {an.risks.length === 0 ? <p className="text-[14px] text-muted">{t('no_items')}</p> : (
          <ul className="list-disc space-y-1.5 pl-5 text-[14px] leading-5">{an.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
        )}
      </Section>
    </Page>
  )
}
