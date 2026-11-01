import type { Assessment, Budget, BudgetLine, Inspection } from '../types'
import { parseNum } from './ids'

export type Bucket = 'required' | 'recommended' | 'optional'
export const BUCKETS: Bucket[] = ['required', 'recommended', 'optional']

export interface ComputedLine extends BudgetLine {
  total: number
  source: 'auto' | 'manual'
  categoryId?: string
  zoneId?: string
  elementId?: string
}

export interface BudgetTotals {
  lines: ComputedLine[]
  byBucket: Record<Bucket, number>
  subtotal: number
  contingency: number
  tax: number
  total: number
  assumptionCount: number
}

export function lineTotal(l: BudgetLine): number {
  if (l.totalOverride !== null && Number.isFinite(l.totalOverride)) return l.totalOverride
  const q = l.quantity ?? 1
  const p = l.unitPrice ?? 0
  return q * p
}

/** Lines derived from assessments with a cost estimate. */
export function autoLines(insp: Inspection, assessments: Assessment[]): ComputedLine[] {
  const out: ComputedLine[] = []
  for (const a of assessments) {
    const cost = parseNum(a.costEstimate)
    if (cost === null || cost === 0) continue
    if (a.intervention !== 'required' && a.intervention !== 'recommended' && a.intervention !== 'optional') continue
    const q = parseNum(a.quantity)
    const line: ComputedLine = {
      id: `auto-${a.id}`, assessmentId: a.id, bucket: a.intervention, source: 'auto',
      description: a.description || '', quantity: q, unit: a.unit, unitPrice: null, totalOverride: cost,
      isAssumption: !!insp.budget.assumptionFlags[a.id],
      categoryId: a.categoryId, zoneId: a.zoneId, elementId: a.elementId,
      total: cost,
    }
    out.push(line)
  }
  return out
}

export function computeBudget(insp: Inspection, assessments: Assessment[]): BudgetTotals {
  const auto = autoLines(insp, assessments)
  const manual: ComputedLine[] = insp.budget.manualLines.map((l) => ({ ...l, source: 'manual', total: lineTotal(l) }))
  const lines = [...auto, ...manual]
  const byBucket: Record<Bucket, number> = { required: 0, recommended: 0, optional: 0 }
  for (const l of lines) byBucket[l.bucket] += l.total
  const subtotal = byBucket.required + byBucket.recommended + byBucket.optional
  const contingency = (subtotal * (insp.budget.contingencyPct || 0)) / 100
  const tax = ((subtotal + contingency) * (insp.budget.taxPct || 0)) / 100
  return {
    lines, byBucket, subtotal, contingency, tax, total: subtotal + contingency + tax,
    assumptionCount: lines.filter((l) => l.isAssumption).length,
  }
}

export const defaultBudget = (): Budget => ({ currency: 'EUR', contingencyPct: 10, taxPct: 0, manualLines: [], assumptionFlags: {} })
