/** Technical checklist catalogue. Labels are resolved through i18n keys `cat.<id>` and `el.<id>`. */
export interface CategoryDef {
  id: string
  code: string
  repeatable: boolean
  elements: string[]
  /** hotel-info flag that makes this category conditional (shown but flagged) */
  icon: string
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'structure', code: 'A', repeatable: false, icon: '🏗️',
    elements: ['foundations', 'columns_beams', 'slabs', 'cracks', 'deformations', 'settlement', 'structural_risks'],
  },
  {
    id: 'exterior', code: 'B', repeatable: false, icon: '🏢',
    elements: ['facade', 'ext_paint', 'render', 'thermal_insulation', 'roof', 'gutters', 'waterproofing', 'ext_windows', 'ext_doors', 'balconies'],
  },
  {
    id: 'rooms', code: 'C', repeatable: true, icon: '🛏️',
    elements: ['walls', 'ceilings', 'floors', 'doors', 'windows', 'paint', 'lighting', 'sockets', 'heating', 'air_conditioning', 'ventilation', 'acoustic_insulation', 'furniture'],
  },
  {
    id: 'bathrooms', code: 'D', repeatable: true, icon: '🚿',
    elements: ['bath_waterproofing', 'tiles', 'claddings', 'showers', 'toilets', 'washbasins', 'taps', 'pipes', 'bath_ventilation', 'silicone', 'humidity'],
  },
  {
    id: 'technical', code: 'E', repeatable: false, icon: '⚡',
    elements: ['electrical', 'switchboards', 'cabling', 'water_distribution', 'sewage', 'hot_water', 'boilers', 'heat_pumps', 'hvac', 'mech_ventilation', 'elevators', 'control_systems'],
  },
  {
    id: 'safety', code: 'F', repeatable: false, icon: '🧯',
    elements: ['emergency_exits', 'fire_doors', 'alarms', 'fire_detectors', 'emergency_lighting', 'extinguishers', 'evacuation', 'accessibility'],
  },
  {
    id: 'common', code: 'G', repeatable: false, icon: '🏛️',
    elements: ['reception', 'corridors', 'stairs', 'restaurant', 'kitchen', 'laundry', 'tech_rooms', 'basement', 'outdoor_areas', 'parking'],
  },
  {
    id: 'documentation', code: 'H', repeatable: false, icon: '📄',
    elements: ['approved_plans', 'use_permits', 'installation_certs', 'fire_docs', 'energy_docs', 'maintenance_records', 'accessibility_docs', 'urban_compliance'],
  },
]

export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id)
export const totalElements = () => CATEGORIES.reduce((n, c) => n + c.elements.length, 0)

/** Trades / specialities suggested in the assessment form */
export const TRADES = [
  'structural_engineer', 'architect', 'electrician', 'plumber', 'hvac_technician', 'roofer', 'painter', 'drywaller',
  'tiler', 'carpenter', 'glazier', 'elevator_technician', 'fire_safety_expert', 'energy_consultant', 'surveyor', 'general_contractor',
] as const

export const UNITS = ['m²', 'm', 'ml', 'pcs', 'set', 'h', 'lump'] as const
