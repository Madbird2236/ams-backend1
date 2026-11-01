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
      <Field key={f.key} label={t(f.label)}>
        <div className="flex gap-2">
          <input
            className="input"
            type={f.type ?? 'text'}
            inputMode={f.type === 'number' ? 'numeric' : undefined}
            value={unknown ? '' : (h[f.key] as string)}
            placeholder={unknown ? t('unknown') : ''}
            disabled={unknown}
            autoComplete="off"
            onChange={(e) => set({ [f.key]: e.target.value } as Partial<HotelInfo>)}
          />
          {f.unknownable && (
            <button type="button" onClick={() => toggleUnknown(f.key)} aria-pressed={unknown}
              className={`press shrink-0 rounded-[var(--radius-control)] border px-3 min-h-11 text-[13px] font-medium ${unknown ? 'border-ink bg-ink text-white' : 'border-control bg-surface text-muted'}`}>
              {t('mark_unknown')}
            </button>
          )}
        </div>
      </Field>
    )
  }

  return (
    <Page className="space-y-5">
      <Section title={t('h_section_identity')}>
        <div className="grid gap-4 sm:grid-cols-2">{TEXT_FIELDS.filter((f) => f.section === 'identity').map(renderText)}</div>
        {isItaly && <p className="mt-4 rounded-[var(--radius-card)] border border-warning-border bg-warning-bg px-3 py-2 text-[13px] leading-[18px] text-warning">{t('italy_notice')}</p>}
      </Section>
      <Section title={t('h_section_building')}>
        <div className="grid gap-4 sm:grid-cols-2">{TEXT_FIELDS.filter((f) => f.section === 'building').map(renderText)}</div>
      </Section>
      <Section title={t('h_section_facilities')} flush>
        <ul className="divide-y divide-rule">
          {FLAGS.map((f) => (
            <li key={f.key} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
              <span className="text-[15px]">{t(f.label)}</span>
              <div className="inline-flex rounded-[var(--radius-control)] border border-control p-0.5" role="group" aria-label={t(f.label)}>
                {(['yes', 'no', 'unknown'] as YesNoUnknown[]).map((v) => (
                  <button key={v} type="button" onClick={() => set({ [f.key]: v } as Partial<HotelInfo>)} aria-pressed={h[f.key] === v}
                    className={`press rounded-[4px] px-3 min-h-9 text-[13px] font-medium ${h[f.key] === v ? 'bg-ink text-white' : 'text-muted'}`}>
                    {t(v)}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <Section title={t('h_notes')}>
        <textarea className="input min-h-24" value={h.notes} onChange={(e) => set({ notes: e.target.value })} aria-label={t('h_notes')} />
      </Section>
      {insp.status === 'draft' ? (
        <button type="button" className="btn-secondary w-full" onClick={() => patchInspection(insp.id, { status: 'completed' })}>{t('mark_completed')}</button>
      ) : (
        <button type="button" className="btn-secondary w-full" onClick={() => patchInspection(insp.id, { status: 'draft' })}>{t('reopen')}</button>
      )}
      <p className="text-center text-[12px] text-muted">{t('saved')} · {t('storage_notice')}</p>
    </Page>
  )
}
