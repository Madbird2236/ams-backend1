import type { Assessment, Condition, HotelInfo, Inspection, Intervention, Lang, Priority, Zone } from '../types'
import { CATEGORIES, categoryById } from '../data/checklist'
import { todayIso, uid } from './ids'

export function emptyHotel(): HotelInfo {
  return {
    name: '', address: '', country: '', region: '', owner: '', client: '', inspectionDate: todayIso(), inspector: '',
    yearBuilt: '', yearRenovated: '', areaM2: '', floors: '', rooms: '', bathrooms: '', beds: '',
    hasBasement: 'unknown', hasRestaurant: 'unknown', hasProKitchen: 'unknown', hasElevator: 'unknown', hasParking: 'unknown', hasPoolSpa: 'unknown',
    unknownFields: [], notes: '',
  }
}

export function newInspection(lang: Lang): Inspection {
  const now = Date.now()
  return {
    id: uid(), createdAt: now, updatedAt: now, lang, status: 'draft',
    hotel: emptyHotel(),
    zones: CATEGORIES.filter((c) => !c.repeatable).map((c) => ({ id: c.id, categoryId: c.id, label: '', createdAt: now })),
    budget: { currency: 'EUR', contingencyPct: 10, taxPct: 0, manualLines: [], assumptionFlags: {} },
  }
}

export function newZone(categoryId: string, label: string): Zone {
  return { id: uid(), categoryId, label, createdAt: Date.now() }
}

export function emptyAssessment(inspectionId: string, categoryId: string, zoneId: string, elementId: string): Assessment {
  return {
    id: uid(), inspectionId, categoryId, zoneId, elementId,
    condition: null, intervention: null, priority: null, suggested: false,
    description: '', notes: '', dimensions: '', quantity: '', unit: '', materials: '', trade: '', costEstimate: '',
    confidence: null, updatedAt: Date.now(),
  }
}

/** Default intervention/priority suggested from a condition. The user can always override. */
export function suggestFromCondition(c: Condition): { intervention: Intervention; priority: Priority | null } {
  switch (c) {
    case 'good': return { intervention: 'none', priority: null }
    case 'light_wear': return { intervention: 'optional', priority: 'P3' }
    case 'needs_repair': return { intervention: 'recommended', priority: 'P2' }
    case 'needs_replacement': return { intervention: 'required', priority: 'P1' }
    case 'not_verified': return { intervention: 'specialist', priority: null }
  }
}

export const isAssessed = (a: Assessment | undefined): boolean => !!a && a.condition !== null

/** All (zone, element) slots that exist for an inspection. */
export function allSlots(insp: Inspection): Array<{ categoryId: string; zoneId: string; elementId: string }> {
  const out: Array<{ categoryId: string; zoneId: string; elementId: string }> = []
  for (const z of insp.zones) {
    const cat = categoryById(z.categoryId)
    if (!cat) continue
    for (const el of cat.elements) out.push({ categoryId: cat.id, zoneId: z.id, elementId: el })
  }
  return out
}

export function zoneLabel(insp: Inspection, zoneId: string, catLabel: string): string {
  const z = insp.zones.find((x) => x.id === zoneId)
  if (!z) return catLabel
  return z.label ? `${catLabel} · ${z.label}` : catLabel
}

export const hotelDisplayName = (h: HotelInfo, fallback: string) => h.name.trim() || fallback
