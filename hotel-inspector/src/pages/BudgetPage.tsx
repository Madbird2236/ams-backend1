import { useOutletContext } from 'react-router-dom'
import type { Assessment, BudgetLine, Currency, Inspection } from '../types'
import { patchInspection } from '../db/hooks'
import { useT } from '../i18n'
import { Page } from '../components/Layout'
import { Field, Section, Empty } from '../components/ui'
import { computeBudget, BUCKETS, type Bucket } from '../lib/budget'
import { fmtMoney, uid } from '../lib/ids'
import { zoneLabel } from '../lib/model'

type Ctx = { insp: Inspection; assessments: Assessment[] }

export default function BudgetPage() {
  const { insp, assessments } = useOutletContext<Ctx>()
  const { t, lang } = useT()
  const b = insp.budget
  const totals = computeBudget(insp, assessments)
  const cur = b.currency
  const m = (n: number) => fmtMoney(n, cur, lang)

  const setBudget = (p: Partial<typeof b>) => patchInspection(insp.id, (i) => ({ budget: { ...i.budget, ...p } }))
  const addLine = (bucket: Bucket) =>
    setBudget({ manualLines: [...b.manualLines, { id: uid(), bucket, description: '', quantity: 1, unit: '', unitPrice: null, totalOverride: null, isAssumption: false }] })
  const updLine = (id: string, p: Partial<BudgetLine>) => setBudget({ manualLines: b.manualLines.map((l) => (l.id === id ? { ...l, ...p } : l)) })
  const delLine = (id: string) => setBudget({ manualLines: b.manualLines.filter((l) => l.id !== id) })
  const toggleAssumption = (assessmentId: string) => setBudget({ assumptionFlags: { ...b.assumptionFlags, [assessmentId]: !b.assumptionFlags[assessmentId] } })

  const num = (v: string): number | null => (v.trim() === '' ? null : Number.isFinite(parseFloat(v.replace(',', '.'))) ? parseFloat(v.replace(',', '.')) : null)

  return (
    <Page className="space-y-4">
      <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">{t('budget_intro')}</p>

      <Section title={t('budget')}>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t('currency')}>
            <div className="grid grid-cols-2 gap-1">
              {(['EUR', 'CHF'] as Currency[]).map((c) => (
                <button key={c} type="button" onClick={() => setBudget({ currency: c })} className={`choice py-3 text-xs ${cur === c ? 'choice-on' : 'choice-off'}`}>{c}</button>
              ))}
            </div>
          </Field>
          <Field label={t('contingency')}><input className="input" inputMode="decimal" value={b.contingencyPct} onChange={(e) => setBudget({ contingencyPct: num(e.target.value) ?? 0 })} /></Field>
          <Field label={t('tax')}><input className="input" inputMode="decimal" value={b.taxPct} onChange={(e) => setBudget({ taxPct: num(e.target.value) ?? 0 })} /></Field>
        </div>
      </Section>

      {BUCKETS.map((bucket) => {
        const lines = totals.lines.filter((l) => l.bucket === bucket)
        return (
          <Section key={bucket} title={t(`bucket_${bucket}`)} right={<span className="text-sm font-bold">{m(totals.byBucket[bucket])}</span>}>
            {lines.length === 0 && <Empty text={t('no_budget_lines')} />}
            <ul className="space-y-2">
              {lines.map((l) =>
                l.source === 'auto' ? (
                  <li key={l.id} className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{zoneLabel(insp, l.zoneId!, t(`cat.${l.categoryId}`))} — {t(`el.${l.elementId}`)}</div>
                        {l.description && <div className="truncate text-xs text-slate-500">{l.description}</div>}
                        {l.quantity !== null && <div className="text-xs text-slate-500">{l.quantity} {l.unit}</div>}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{m(l.total)}</div>
                        <label className="mt-1 flex items-center justify-end gap-1 text-[11px] text-slate-600">
                          <input type="checkbox" checked={l.isAssumption} onChange={() => toggleAssumption(l.assessmentId!)} /> {t('is_assumption')}
                        </label>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li key={l.id} className="rounded-xl border border-slate-200 p-2">
                    <input className="input mb-2 py-2 text-sm" placeholder={t('description')} value={l.description} onChange={(e) => updLine(l.id, { description: e.target.value })} />
                    <div className="grid grid-cols-12 gap-1.5">
                      <input className="input col-span-3 py-2 text-sm" inputMode="decimal" placeholder={t('quantity')} value={l.quantity ?? ''} onChange={(e) => updLine(l.id, { quantity: num(e.target.value) })} />
                      <input className="input col-span-2 py-2 text-sm" placeholder={t('unit')} value={l.unit} onChange={(e) => updLine(l.id, { unit: e.target.value })} />
                      <input className="input col-span-3 py-2 text-sm" inputMode="decimal" placeholder={t('unit_price')} value={l.unitPrice ?? ''} onChange={(e) => updLine(l.id, { unitPrice: num(e.target.value) })} />
                      <input className="input col-span-4 py-2 text-sm font-semibold" inputMode="decimal" placeholder={t('line_total')} value={l.totalOverride ?? ''} onChange={(e) => updLine(l.id, { totalOverride: num(e.target.value) })} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <label className="flex items-center gap-1 text-slate-600"><input type="checkbox" checked={l.isAssumption} onChange={(e) => updLine(l.id, { isAssumption: e.target.checked })} /> {t('is_assumption')}</label>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{m(l.total)}</span>
                        <button type="button" onClick={() => delLine(l.id)} className="text-red-600 underline">{t('delete')}</button>
                      </div>
                    </div>
                  </li>
                ),
              )}
            </ul>
            <button type="button" onClick={() => addLine(bucket)} className="btn-secondary mt-3 w-full py-2 text-sm">＋ {t('add_line')}</button>
          </Section>
        )
      })}

      <Section title={t('total_all')}>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt>{t('bucket_required')}</dt><dd className="font-semibold">{m(totals.byBucket.required)}</dd></div>
          <div className="flex justify-between"><dt>{t('bucket_recommended')}</dt><dd className="font-semibold">{m(totals.byBucket.recommended)}</dd></div>
          <div className="flex justify-between"><dt>{t('bucket_optional')}</dt><dd className="font-semibold">{m(totals.byBucket.optional)}</dd></div>
          <div className="flex justify-between border-t border-slate-200 pt-1"><dt>{t('subtotal')}</dt><dd className="font-semibold">{m(totals.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>{t('total_contingency')} ({b.contingencyPct}%)</dt><dd className="font-semibold">{m(totals.contingency)}</dd></div>
          {b.taxPct > 0 && <div className="flex justify-between"><dt>{t('total_tax')} ({b.taxPct}%)</dt><dd className="font-semibold">{m(totals.tax)}</dd></div>}
          <div className="flex justify-between border-t-2 border-brand-900 pt-2 text-base"><dt className="font-bold">{t('total_all')}</dt><dd className="font-extrabold">{m(totals.total)}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-slate-500">{t('auto_lines_hint')} {t('excluded_specialist_note')}</p>
        {totals.assumptionCount > 0 && <p className="mt-1 text-xs text-amber-700">{t('assumptions_note', { n: totals.assumptionCount })}</p>}
      </Section>
    </Page>
  )
}
