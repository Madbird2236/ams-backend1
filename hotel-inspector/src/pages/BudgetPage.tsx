import { useOutletContext } from 'react-router-dom'
import { Plus } from '@phosphor-icons/react'
import type { Assessment, BudgetLine, Currency, Inspection } from '../types'
import { patchInspection } from '../db/hooks'
import { useT } from '../i18n'
import { Page } from '../components/Layout'
import { Field, Section } from '../components/ui'
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
    <Page className="space-y-5">
      <p className="text-[13px] leading-[18px] text-muted">{t('budget_intro')}</p>

      <Section title={t('budget')}>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t('currency')}>
            <div className="inline-flex w-full rounded-[var(--radius-control)] border border-control p-0.5" role="group">
              {(['EUR', 'CHF'] as Currency[]).map((c) => (
                <button key={c} type="button" onClick={() => setBudget({ currency: c })} aria-pressed={cur === c} className={`press flex-1 rounded-[4px] min-h-9 text-[13px] font-medium ${cur === c ? 'bg-ink text-white' : 'text-muted'}`}>{c}</button>
              ))}
            </div>
          </Field>
          <Field label={t('contingency')}><input className="input num" inputMode="decimal" value={b.contingencyPct} onChange={(e) => setBudget({ contingencyPct: num(e.target.value) ?? 0 })} /></Field>
          <Field label={t('tax')}><input className="input num" inputMode="decimal" value={b.taxPct} onChange={(e) => setBudget({ taxPct: num(e.target.value) ?? 0 })} /></Field>
        </div>
      </Section>

      {BUCKETS.map((bucket) => {
        const lines = totals.lines.filter((l) => l.bucket === bucket)
        return (
          <Section key={bucket} title={t(`bucket_${bucket}`)} right={<span className="text-ink font-medium">{m(totals.byBucket[bucket])}</span>} flush>
            {lines.length === 0 && <p className="px-4 py-3 text-[14px] text-muted">{t('no_budget_lines')}</p>}
            <ul className="divide-y divide-rule">
              {lines.map((l) =>
                l.source === 'auto' ? (
                  <li key={l.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-medium">{zoneLabel(insp, l.zoneId!, t(`cat.${l.categoryId}`))} — {t(`el.${l.elementId}`)}</div>
                      <div className="truncate text-[13px] text-muted">{[l.description, l.quantity !== null ? `${l.quantity} ${l.unit}`.trim() : ''].filter(Boolean).join(' · ') || t('auto_lines')}</div>
                      <label className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-muted"><input type="checkbox" checked={l.isAssumption} onChange={() => toggleAssumption(l.assessmentId!)} /> {t('is_assumption')}</label>
                    </div>
                    <div className="num text-right text-[15px] font-medium">{m(l.total)}</div>
                  </li>
                ) : (
                  <li key={l.id} className="px-4 py-3">
                    <input className="input mb-2" placeholder={t('description')} value={l.description} onChange={(e) => updLine(l.id, { description: e.target.value })} aria-label={t('description')} />
                    <div className="grid grid-cols-12 gap-1.5">
                      <input className="input num col-span-4" inputMode="decimal" placeholder={t('quantity')} value={l.quantity ?? ''} onChange={(e) => updLine(l.id, { quantity: num(e.target.value) })} aria-label={t('quantity')} />
                      <input className="input col-span-3" placeholder={t('unit')} value={l.unit} onChange={(e) => updLine(l.id, { unit: e.target.value })} aria-label={t('unit')} />
                      <input className="input num col-span-5" inputMode="decimal" placeholder={t('unit_price')} value={l.unitPrice ?? ''} onChange={(e) => updLine(l.id, { unitPrice: num(e.target.value) })} aria-label={t('unit_price')} />
                      <input className="input num col-span-12 font-medium" inputMode="decimal" placeholder={`${t('line_total')} (${t('optional_field')})`} value={l.totalOverride ?? ''} onChange={(e) => updLine(l.id, { totalOverride: num(e.target.value) })} aria-label={t('line_total')} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[13px]">
                      <label className="inline-flex items-center gap-1.5 text-muted"><input type="checkbox" checked={l.isAssumption} onChange={(e) => updLine(l.id, { isAssumption: e.target.checked })} /> {t('is_assumption')}</label>
                      <div className="flex items-center gap-4">
                        <span className="num font-medium">{m(l.total)}</span>
                        <button type="button" onClick={() => delLine(l.id)} className="text-negative-ink underline underline-offset-2">{t('delete')}</button>
                      </div>
                    </div>
                  </li>
                ),
              )}
            </ul>
            <div className="border-t border-rule p-2">
              <button type="button" onClick={() => addLine(bucket)} className="btn-ghost w-full min-h-10 text-[14px]"><Plus size={16} aria-hidden /> {t('add_line')}</button>
            </div>
          </Section>
        )
      })}

      <Section title={t('total_all')}>
        <dl className="num space-y-1.5 text-[14px]">
          <div className="flex justify-between gap-3"><dt className="text-muted">{t('bucket_required')}</dt><dd>{m(totals.byBucket.required)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">{t('bucket_recommended')}</dt><dd>{m(totals.byBucket.recommended)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">{t('bucket_optional')}</dt><dd>{m(totals.byBucket.optional)}</dd></div>
          <div className="flex justify-between gap-3 border-t border-rule pt-1.5"><dt className="text-muted">{t('subtotal')}</dt><dd>{m(totals.subtotal)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">{t('total_contingency')} ({b.contingencyPct}%)</dt><dd>{m(totals.contingency)}</dd></div>
          {b.taxPct > 0 && <div className="flex justify-between gap-3"><dt className="text-muted">{t('total_tax')} ({b.taxPct}%)</dt><dd>{m(totals.tax)}</dd></div>}
          <div className="flex items-baseline justify-between gap-3 border-t border-ink pt-2"><dt className="font-medium">{t('total_all')}</dt><dd className="text-[24px] leading-7 font-semibold">{m(totals.total)}</dd></div>
        </dl>
        <p className="mt-3 text-[12px] leading-4 text-muted">{t('auto_lines_hint')} {t('excluded_specialist_note')}</p>
        {totals.assumptionCount > 0 && <p className="mt-1 text-[12px] leading-4 text-warning">{t('assumptions_note', { n: totals.assumptionCount })}</p>}
      </Section>
    </Page>
  )
}
