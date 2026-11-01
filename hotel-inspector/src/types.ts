export type Lang = 'pt' | 'de' | 'it' | 'en'
export type Currency = 'EUR' | 'CHF'

export type Condition =
  | 'good'
  | 'light_wear'
  | 'needs_repair'
  | 'needs_replacement'
  | 'not_verified'

export type Intervention =
  | 'required'
  | 'recommended'
  | 'optional'
  | 'none'
  | 'specialist'

export type Priority = 'P0' | 'P1' | 'P2' | 'P3'
export type Confidence = 'high' | 'medium' | 'low'
export type YesNoUnknown = 'yes' | 'no' | 'unknown'

export const CONDITIONS: Condition[] = ['good', 'light_wear', 'needs_repair', 'needs_replacement', 'not_verified']
export const INTERVENTIONS: Intervention[] = ['required', 'recommended', 'optional', 'none', 'specialist']
export const PRIORITIES: Priority[] = ['P0', 'P1', 'P2', 'P3']
export const CONFIDENCES: Confidence[] = ['high', 'medium', 'low']

export interface HotelInfo {
  name: string
  address: string
  country: string
  region: string
  owner: string
  client: string
  inspectionDate: string // ISO date yyyy-mm-dd
  inspector: string
  yearBuilt: string
  yearRenovated: string
  areaM2: string
  floors: string
  rooms: string
  bathrooms: string
  beds: string
  hasBasement: YesNoUnknown
  hasRestaurant: YesNoUnknown
  hasProKitchen: YesNoUnknown
  hasElevator: YesNoUnknown
  hasParking: YesNoUnknown
  hasPoolSpa: YesNoUnknown
  /** field keys the user explicitly marked as unknown */
  unknownFields: string[]
  notes: string
}

/** A zone is an instance of a category (e.g. "Room 101"). Non-repeatable categories have a single zone with id === categoryId. */
export interface Zone {
  id: string
  categoryId: string
  label: string
  createdAt: number
}

export interface BudgetLine {
  id: string
  /** 'required' | 'recommended' | 'optional' — which bucket this line belongs to */
  bucket: 'required' | 'recommended' | 'optional'
  description: string
  quantity: number | null
  unit: string
  unitPrice: number | null
  /** overrides quantity*unitPrice when set */
  totalOverride: number | null
  isAssumption: boolean
  /** linked assessment id (auto lines) */
  assessmentId?: string
}

export interface Budget {
  currency: Currency
  contingencyPct: number
  taxPct: number
  manualLines: BudgetLine[]
  /** per-assessment flags for auto lines: key = assessmentId */
  assumptionFlags: Record<string, boolean>
}

export interface Inspection {
  id: string
  createdAt: number
  updatedAt: number
  lang: Lang
  hotel: HotelInfo
  zones: Zone[]
  budget: Budget
  status: 'draft' | 'completed'
}

export interface Assessment {
  id: string
  inspectionId: string
  categoryId: string
  zoneId: string
  elementId: string
  condition: Condition | null
  intervention: Intervention | null
  priority: Priority | null
  /** true while intervention/priority were auto-suggested and not yet edited by the user */
  suggested: boolean
  description: string
  notes: string
  dimensions: string
  quantity: string
  unit: string
  materials: string
  trade: string
  costEstimate: string
  confidence: Confidence | null
  updatedAt: number
}

export type MediaKind = 'photo' | 'audio' | 'video'

/** A media record attached to an element assessment. Table is still called `photos` for compatibility. */
export interface Photo {
  id: string
  inspectionId: string
  assessmentId: string
  blob: Blob
  caption: string
  createdAt: number
  /** defaults to 'photo' for records created before media support */
  kind?: MediaKind
  mimeType?: string
  /** seconds, for audio/video */
  duration?: number
}
export type Media = Photo

export interface ExportBundle {
  app: 'ams-hotel-inspector'
  version: 1
  exportedAt: number
  inspections: Inspection[]
  assessments: Assessment[]
  photos: Array<Omit<Photo, 'blob'> & { dataUrl: string }>
}
