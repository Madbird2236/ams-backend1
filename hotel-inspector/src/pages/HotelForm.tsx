import { useOutletContext } from 'react-router-dom'
import type { Assessment, HotelInfo, Inspection, YesNoUnknown } from '../types'
import { patchInspection } from '../db/hooks'
import { useT } from '../i18n'
import { Page } from '../components/Layout'
import { Field, Section } from '../components/ui'

type Ctx = { insp: Inspection; assessments: Assessment[] }

const TEXT_FIELDS: Array<{ key: keyof HotelInfo; label: string; type?: string; unknownable?: boolean; section: 'identity' | 'building' }> = [
  { key: 'name', label: 'h_name', section: 'identity' },
  { key: 'address', label: 'h_address', section: 'identity' },
  { key: 'country', label: 'h_country', section: 'identity' },
  { key: 'region', label: 'h_region', section: 'identity' },
  { key: 'owner', label: 'h_owner', section: 'identity', unknownable: true },
  { key: 'client', label: 'h_client', section: 'identity' },
  { key: 'inspector', label: 'h_inspector', section: 'identity' },
  { key: 'inspectionDate', label: 'h_inspection_date', type: 'date', section: 'identity' },
  { key: 'yearBuilt', label: 'h_year_built', type: 'number', unknownable: true, section: 'building' },
  { key: 'yearRenovated', label: 'h_year_renovated', type: 'number', unknownable: true, section: 'building' },
  { key: 'areaM2', label: 'h_area', type: 'number', unknownable: true, section: 'building' },
  { key: 'floors', label: 'h_floors', type: 'number', unknownable: true, section: 'building' },
  { key: 'rooms', label: 'h_rooms', type: 'number', unknownable: true, section: 'building' },
  { key: 'bathrooms', label: 'h_bathrooms', type: 'number', unknownable: true, section: 'building' },
  { key: 'beds', label: 'h_beds', type: 'number', unknownable: true, section: 'building' },
]

const FLAGS: Array<{ key: keyof HotelInfo; label: string }> = [
  { key: 'hasBasement', label: 'h_basement' },
  { key: 'hasRestaurant', label: 'h_restaurant' },
  { key: 'hasProKitchen', label: 'h_pro_kitchen' },
  { key: 'hasElevator', label: 'h_elevator' },
  { key: 'hasParking', label: 'h_parking' },
  { key: 'hasPoolSpa', label: 'h_pool_spa' },
]

export default function HotelForm() {
  const { insp } = useOutletContext<Ctx>()
  const { t } = useT()
  const h = insp.hotel

  const set = (patch: Partial<HotelInfo>) => patchInspection(insp.id, (i) => ({ hotel: { ...i.hotel, ...patch } }))
  const toggleUnknown = (key: string) =>
    patchInspection(insp.id, (i) => {
      const u = new Set(i.hotel.unknownFields)
      if (u.has(key)) u.delete(key); else u.add(key)
      return { hotel: { ...i.hotel, unknownFields: [...u], [key]: u.has(key) ? '' : (i.hotel as unknown as Record<string, string>)[key] } }
    })

  const isItaly = /ital|itália|italia|^it$/i.test(h.country.trim())

  const renderText = (f: (typeof TEXT_FIELDS)[number]) => {
    const unknown = h.unknownFields.includes(f.key)
    return (
      <Field
        key={f.key}
        label={t(f.label)}
        right={f.unknownable ? (
          <button type="button" onClick={() => toggleUnknown(f.key)} className={`chip ${unknown ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {t('mark_unknown')}
          </button>
        ) : undefined}
      >
        <input
          className="input disabled:bg-slate-100 disabled:text-slate-400"
          type={f.type ?? 'text'}
          inputMode={f.type === 'number' ? 'numeric' : undefined}
          value={unknown ? '' : (h[f.key] as string)}
          placeholder={unknown ? t('unknown') : ''}
          disabled={unknown}
          onChange={(e) => set({ [f.key]: e.target.value } as Partial<HotelInfo>)}
        />
      </Field>
    )
  }

  return (
    <Page className="space-y-4">
      <Section title={t('h_section_identity')}>
        <div className="grid gap-3 sm:grid-cols-2">{TEXT_FIELDS.filter((f) => f.section === 'identity').map(renderText)}</div>
        {isItaly && <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">{t('italy_notice')}</p>}
      </Section>
      <Section title={t('h_section_building')}>
        <div className="grid grid-cols-2 gap-3">{TEXT_FIELDS.filter((f) => f.section === 'building').map(renderText)}</div>
      </Section>
      <Section title={t('h_section_facilities')}>
        <div className="space-y-3">
          {FLAGS.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{t(f.label)}</span>
              <div className="inline-flex rounded-xl border border-slate-200 p-1">
                {(['yes', 'no', 'unknown'] as YesNoUnknown[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set({ [f.key]: v } as Partial<HotelInfo>)}
                    className={`rounded-lg px-3 py-2 text-xs font-bold ${h[f.key] === v ? (v === 'yes' ? 'bg-emerald-600 text-white' : v === 'no' ? 'bg-slate-700 text-white' : 'bg-slate-400 text-white') : 'text-slate-600'}`}
                  >
                    {t(v)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title={t('h_notes')}>
        <textarea className="input min-h-24" value={h.notes} onChange={(e) => set({ notes: e.target.value })} />
      </Section>
      <div className="flex gap-2">
        {insp.status === 'draft' ? (
          <button type="button" className="btn-secondary flex-1" onClick={() => patchInspection(insp.id, { status: 'completed' })}>{t('mark_completed')}</button>
        ) : (
          <button type="button" className="btn-secondary flex-1" onClick={() => patchInspection(insp.id, { status: 'draft' })}>{t('reopen')}</button>
        )}
      </div>
      <p className="text-center text-xs text-slate-400">{t('saved')} ✓ — {t('storage_notice')}</p>
    </Page>
  )
}
