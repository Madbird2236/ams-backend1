import type { Assessment, Inspection } from '../types'
import { CATEGORIES, categoryById } from '../data/checklist'
import { allSlots, isAssessed } from './model'
import type { TFn } from '../i18n'
import { parseNum } from './ids'

export interface CategoryStats {
  categoryId: string
  total: number
  assessed: number
  good: number // good + light_wear
  repair: number
  replace: number
  unverified: number
  notAssessed: number
  required: number
  recommended: number
  optional: number
  specialist: number
  p0: number
  p1: number
}

export type ConclusionKind = 'well_preserved' | 'partial' | 'deep' | 'insufficient'

export interface Analysis {
  totalSlots: number
  assessedCount: number
  coveragePct: number
  critical: Assessment[] // P0
  required: Assessment[]
  recommended: Assessment[]
  optional: Assessment[]
  canRemain: Assessment[]
  specialist: Assessment[]
  notVerified: Assessment[]
  notAssessed: Array<{ categoryId: string; zoneId: string; elementId: string }>
  byCategory: CategoryStats[]
  risks: string[]
  conclusion: { kind: ConclusionKind; reasons: string[] }
}

export const MIN_COVERAGE_PCT = 40
const KEY_CATEGORIES = ['structure', 'technical', 'safety']
const KEY_CAT_MIN_PCT = 50

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100))

export function analyze(insp: Inspection, assessments: Assessment[], t: TFn): Analysis {
  const slots = allSlots(insp)
  const byKey = new Map(assessments.map((a) => [`${a.zoneId}|${a.elementId}`, a]))
  const assessed = slots.map((s) => byKey.get(`${s.zoneId}|${s.elementId}`)).filter(isAssessed) as Assessment[]
  const notAssessed = slots.filter((s) => !isAssessed(byKey.get(`${s.zoneId}|${s.elementId}`)))

  const critical = assessed.filter((a) => a.priority === 'P0')
  const required = assessed.filter((a) => a.intervention === 'required')
  const recommended = assessed.filter((a) => a.intervention === 'recommended')
  const optional = assessed.filter((a) => a.intervention === 'optional')
  const specialist = assessed.filter((a) => a.intervention === 'specialist' || (a.trade && a.intervention !== 'none'))
  const notVerified = assessed.filter((a) => a.condition === 'not_verified')
  const canRemain = assessed.filter(
    (a) => (a.condition === 'good' || a.condition === 'light_wear') && (a.intervention === 'none' || a.intervention === 'optional' || a.intervention === null),
  )

  const byCategory: CategoryStats[] = CATEGORIES.map((c) => {
    const catSlots = slots.filter((s) => s.categoryId === c.id)
    const catAss = assessed.filter((a) => a.categoryId === c.id)
    return {
      categoryId: c.id,
      total: catSlots.length,
      assessed: catAss.length,
      good: catAss.filter((a) => a.condition === 'good' || a.condition === 'light_wear').length,
      repair: catAss.filter((a) => a.condition === 'needs_repair').length,
      replace: catAss.filter((a) => a.condition === 'needs_replacement').length,
      unverified: catAss.filter((a) => a.condition === 'not_verified').length,
      notAssessed: catSlots.length - catAss.length,
      required: catAss.filter((a) => a.intervention === 'required').length,
      recommended: catAss.filter((a) => a.intervention === 'recommended').length,
      optional: catAss.filter((a) => a.intervention === 'optional').length,
      specialist: catAss.filter((a) => a.intervention === 'specialist').length,
      p0: catAss.filter((a) => a.priority === 'P0').length,
      p1: catAss.filter((a) => a.priority === 'P1').length,
    }
  })

  // ---- Financial risks (strictly derived from recorded data)
  const risks: string[] = []
  if (critical.length) risks.push(t('risk.p0', { n: critical.length }))
  const st = byCategory.find((c) => c.categoryId === 'structure')!
  if (st.total && st.unverified + st.notAssessed > 0) risks.push(t('risk.structure_unverified', { n: st.unverified + st.notAssessed, t: st.total }))
  const te = byCategory.find((c) => c.categoryId === 'technical')!
  if (te.total && te.unverified + te.notAssessed > 0) risks.push(t('risk.technical_unverified', { n: te.unverified + te.notAssessed, t: te.total }))
  const sa = byCategory.find((c) => c.categoryId === 'safety')!
  if (sa.repair + sa.replace > 0) risks.push(t('risk.safety_issues', { n: sa.repair + sa.replace }))
  const lowConfReq = required.filter((a) => a.confidence === 'low').length
  if (lowConfReq) risks.push(t('risk.low_confidence_required', { n: lowConfReq }))
  const noCost = [...required, ...recommended].filter((a) => parseNum(a.costEstimate) === null).length
  if (noCost) risks.push(t('risk.no_costs', { n: noCost }))
  const doc = byCategory.find((c) => c.categoryId === 'documentation')!
  const docIssues = assessed.filter((a) => a.categoryId === 'documentation' && a.condition !== 'good' && a.condition !== 'light_wear').length
  if (doc.total && docIssues) risks.push(t('risk.documentation', { n: docIssues }))
  const assessedNonNV = assessed.filter((a) => a.condition !== 'not_verified')
  const replaceShare = pct(assessedNonNV.filter((a) => a.condition === 'needs_replacement').length, assessedNonNV.length)
  if (assessedNonNV.length >= 5 && replaceShare >= 25) risks.push(t('risk.replacement_share', { p: replaceShare }))
  const declaredRooms = parseNum(insp.hotel.rooms)
  const inspectedRooms = insp.zones.filter((z) => z.categoryId === 'rooms' && assessed.some((a) => a.zoneId === z.id)).length
  if (declaredRooms && declaredRooms > 0 && inspectedRooms < declaredRooms) {
    const p = pct(inspectedRooms, declaredRooms)
    if (p < 50) risks.push(t('risk.rooms_sample', { n: inspectedRooms, t: declaredRooms, p }))
  }

  // ---- Conclusion (rule based, transparent)
  const coveragePct = pct(assessed.length, slots.length)
  const reasons: string[] = []
  let kind: ConclusionKind
  const weakKeyCats = KEY_CATEGORIES.filter((id) => {
    const c = byCategory.find((x) => x.categoryId === id)!
    return c.total > 0 && pct(c.assessed - c.unverified, c.total) < KEY_CAT_MIN_PCT
  })
  const requiredShare = pct(required.length, assessedNonNV.length)
  const repairShare = pct(assessedNonNV.filter((a) => a.condition === 'needs_repair' || a.condition === 'needs_replacement').length, assessedNonNV.length)

  if (coveragePct < MIN_COVERAGE_PCT) {
    kind = 'insufficient'
    reasons.push(t('concl.reason.coverage', { p: coveragePct, m: MIN_COVERAGE_PCT }))
  } else if (critical.length > 0 || replaceShare >= 25 || requiredShare >= 30) {
    kind = 'deep'
    if (critical.length) reasons.push(t('concl.reason.p0', { n: critical.length }))
    if (replaceShare >= 25) reasons.push(t('concl.reason.replacement_share', { p: replaceShare }))
    if (requiredShare >= 30) reasons.push(t('concl.reason.required_share', { p: requiredShare }))
    if (weakKeyCats.length) reasons.push(t('concl.reason.key_cats', { c: weakKeyCats.map((id) => t(`cat.${id}`)).join(', ') }))
  } else if (weakKeyCats.length) {
    kind = 'insufficient'
    reasons.push(t('concl.reason.key_cats', { c: weakKeyCats.map((id) => t(`cat.${id}`)).join(', ') }))
    if (required.length) reasons.push(t('concl.reason.required_count', { n: required.length }))
  } else if (required.length > 0 || repairShare >= 15 || assessed.some((a) => a.priority === 'P1')) {
    kind = 'partial'
    if (required.length) reasons.push(t('concl.reason.required_count', { n: required.length }))
    reasons.push(t('concl.reason.repair_share', { p: repairShare }))
  } else {
    kind = 'well_preserved'
    reasons.push(t('concl.reason.fine', { p: pct(assessedNonNV.filter((a) => a.condition === 'good' || a.condition === 'light_wear').length, assessedNonNV.length) }))
  }

  return {
    totalSlots: slots.length, assessedCount: assessed.length, coveragePct,
    critical, required, recommended, optional, canRemain, specialist, notVerified, notAssessed,
    byCategory, risks, conclusion: { kind, reasons },
  }
}

export const sortByPriority = (list: Assessment[]) => {
  const rank = { P0: 0, P1: 1, P2: 2, P3: 3 } as Record<string, number>
  return [...list].sort((a, b) => (rank[a.priority ?? 'zz'] ?? 9) - (rank[b.priority ?? 'zz'] ?? 9))
}

export const categoryCode = (id: string) => categoryById(id)?.code ?? '?'
