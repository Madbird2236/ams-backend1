import { Link, useOutletContext } from 'react-router-dom'
import type { Assessment, Inspection } from '../types'
import { useT } from '../i18n'
import { Page } from '../components/Layout'
import { Section, Stat, Empty, PriorityBadge, ConditionChip, ProgressBar } from '../components/ui'
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

  const List = ({ items, tone }: { items: Assessment[]; tone?: string }) =>
    items.length === 0 ? <Empty text={t('no_items')} /> : (
      <ul className="divide-y divide-slate-100">
        {sortByPriority(items).map((a) => (
          <li key={a.id}>
            <Link to={linkFor(a)} className={`flex items-start gap-2 py-2.5 ${tone ?? ''}`}>
              <PriorityBadge p={a.priority} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{label(a)}</div>
                {a.description && <div className="truncate text-xs text-slate-500">{a.description}</div>}
              </div>
              <ConditionChip c={a.condition} />
            </Link>
          </li>
        ))}
      </ul>
    )

  const conclTone = { well_preserved: 'ok', partial: 'warn', deep: 'danger', insufficient: 'muted' } as const

  return (
    <Page className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('coverage')} value={`${an.coveragePct}%`} tone="default" />
        <Stat label={t('critical_issues')} value={an.critical.length} tone={an.critical.length ? 'danger' : 'ok'} />
        <Stat label={t('required_works')} value={an.required.length} tone={an.required.length ? 'warn' : 'ok'} />
        <Stat label={t('pending_checks')} value={an.specialist.length + an.notVerified.length} tone="muted" />
      </div>

      <Section title={t('conclusion')}>
        <div className={`rounded-xl border p-3 ${{ ok: 'border-emerald-200 bg-emerald-50', warn: 'border-amber-200 bg-amber-50', danger: 'border-red-200 bg-red-50', muted: 'border-slate-200 bg-slate-50' }[conclTone[an.conclusion.kind]]}`}>
          <div className="font-bold">{t(`concl.${an.conclusion.kind}`)}</div>
          <ul className="mt-1 list-disc pl-5 text-xs text-slate-700">{an.conclusion.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
        <p className="mt-2 text-xs text-slate-500">{t('summary_disclaimer')}</p>
      </Section>

      <Section title={t('overview_by_category')}>
        <ul className="space-y-3">
          {an.byCategory.map((c) => {
            const cat = categoryById(c.categoryId)!
            return (
              <li key={c.categoryId}>
                <Link to={`/i/${insp.id}/c/${c.categoryId}`} className="block">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{cat.code}. {t(`cat.${c.categoryId}`)}</span>
                    <span className="text-xs text-slate-500">{c.assessed}/{c.total}</span>
                  </div>
                  <ProgressBar value={c.assessed} max={c.total} className="mt-1" />
                  <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                    {c.good > 0 && <span className="chip bg-emerald-100 text-emerald-800">{t('rep_table_good')}: {c.good}</span>}
                    {c.repair > 0 && <span className="chip bg-amber-100 text-amber-800">{t('rep_table_repair')}: {c.repair}</span>}
                    {c.replace > 0 && <span className="chip bg-red-100 text-red-800">{t('rep_table_replace')}: {c.replace}</span>}
                    {c.unverified > 0 && <span className="chip bg-slate-200 text-slate-700">{t('rep_table_unverified')}: {c.unverified}</span>}
                    {c.p0 > 0 && <span className="chip bg-red-600 text-white">P0: {c.p0}</span>}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title={t('critical_issues')}><List items={an.critical} /></Section>
      <Section title={t('required_works')}><List items={an.required.filter((a) => a.priority !== 'P0')} /></Section>
      <Section title={t('recommended_repairs')}><List items={an.recommended} /></Section>
      <Section title={t('can_remain')}><List items={an.canRemain} /></Section>
      <Section title={t('optional_improvements')}><List items={an.optional} /></Section>

      <Section title={t('pending_checks')}>
        <List items={[...new Map([...an.specialist, ...an.notVerified].map((a) => [a.id, a])).values()]} />
      </Section>

      <Section title={t('not_assessed_areas')} right={<span className="text-xs text-slate-500">{an.notAssessed.length}</span>}>
        {an.notAssessed.length === 0 ? <Empty text={t('no_items')} /> : (
          <div className="flex flex-wrap gap-1.5">
            {an.notAssessed.slice(0, 60).map((s) => (
              <Link key={`${s.zoneId}|${s.elementId}`} to={`/i/${insp.id}/c/${s.categoryId}/z/${s.zoneId}/e/${s.elementId}`} className="chip bg-slate-100 text-slate-600 hover:bg-slate-200">
                {categoryById(s.categoryId)?.code} · {t(`el.${s.elementId}`)}{(() => { const z = insp.zones.find((x) => x.id === s.zoneId); return z?.label ? ` (${z.label})` : '' })()}
              </Link>
            ))}
            {an.notAssessed.length > 60 && <span className="chip bg-slate-100 text-slate-500">+{an.notAssessed.length - 60}</span>}
          </div>
        )}
      </Section>

      <Section title={t('financial_risks')}>
        {an.risks.length === 0 ? <Empty text={t('no_items')} /> : (
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">{an.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
        )}
      </Section>
    </Page>
  )
}
