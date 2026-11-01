import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus } from '@phosphor-icons/react'
import { db } from '../db'
import { useInspection, useAssessments, patchInspection, touchInspection } from '../db/hooks'
import { categoryById } from '../data/checklist'
import { useT } from '../i18n'
import { Page, TopBar } from '../components/Layout'
import { ConditionPill, PriorityPill, Pill, Track, Empty, Chevron, interventionTone } from '../components/ui'
import { isAssessed, newZone } from '../lib/model'

export default function Category() {
  const { id, catId } = useParams()
  const nav = useNavigate()
  const { t } = useT()
  const insp = useInspection(id)
  const assessments = useAssessments(id)
  const cat = categoryById(catId ?? '')
  const [newLabel, setNewLabel] = useState('')
  const [activeZone, setActiveZone] = useState<string | null>(null)

  if (!insp || !cat) return null
  const zones = insp.zones.filter((z) => z.categoryId === cat.id)
  const zoneId = cat.repeatable ? (activeZone && zones.some((z) => z.id === activeZone) ? activeZone : zones[0]?.id ?? null) : cat.id

  const addZone = async () => {
    const label = newLabel.trim() || `${t(`cat.${cat.id}`)} ${zones.length + 1}`
    const z = newZone(cat.id, label)
    await patchInspection(insp.id, (i) => ({ zones: [...i.zones, z] }))
    setNewLabel('')
    setActiveZone(z.id)
  }

  const renameZone = async (zid: string) => {
    const cur = zones.find((z) => z.id === zid)
    const label = prompt(t('rename_zone'), cur?.label ?? '')
    if (label === null) return
    await patchInspection(insp.id, (i) => ({ zones: i.zones.map((z) => (z.id === zid ? { ...z, label: label.trim() } : z)) }))
  }

  const deleteZone = async (zid: string) => {
    if (!confirm(t('delete_zone_confirm'))) return
    const ass = (assessments ?? []).filter((a) => a.zoneId === zid)
    await db.transaction('rw', db.assessments, db.photos, async () => {
      await db.photos.where('assessmentId').anyOf(ass.map((a) => a.id)).delete()
      await db.assessments.where('zoneId').equals(zid).delete()
    })
    await patchInspection(insp.id, (i) => ({ zones: i.zones.filter((z) => z.id !== zid) }))
    setActiveZone(null)
  }

  const zoneAss = (assessments ?? []).filter((a) => a.zoneId === zoneId)
  const done = cat.elements.filter((el) => isAssessed(zoneAss.find((a) => a.elementId === el))).length

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title={`${cat.code}. ${t(`cat.${cat.id}`)}`} subtitle={t('elements_assessed', { a: done, b: cat.elements.length })} back={`/i/${insp.id}/checklist`} />
      <Page className="space-y-5">
        {cat.repeatable && (
          <section>
            <div className="mb-2 flex items-baseline justify-between px-0.5">
              <h2 className="text-[16px] font-semibold leading-6">{t('zones')}</h2>
              <span className="num text-[13px] text-muted">{zones.length}</span>
            </div>
            {zones.length > 0 && (
              <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
                {zones.map((z) => {
                  const zd = (assessments ?? []).filter((a) => a.zoneId === z.id && isAssessed(a)).length
                  const on = z.id === zoneId
                  return (
                    <button key={z.id} type="button" onClick={() => setActiveZone(z.id)} aria-pressed={on}
                      className={`press shrink-0 rounded-[var(--radius-control)] border px-3 min-h-10 text-[14px] font-medium ${on ? 'border-ink bg-ink text-white' : 'border-control bg-surface text-ink'}`}>
                      {z.label || '—'} <span className={`num ml-1 text-[12px] ${on ? 'text-white/70' : 'text-muted'}`}>{zd}/{cat.elements.length}</span>
                    </button>
                  )
                })}
              </div>
            )}
            <div className="flex gap-2">
              <input className="input" placeholder={t('zone_label_placeholder')} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addZone()} aria-label={t('add_zone')} />
              <button type="button" onClick={addZone} className="btn-primary shrink-0"><Plus size={16} weight="bold" aria-hidden /> {t('add')}</button>
            </div>
            {zoneId && (
              <div className="mt-2 flex justify-end gap-4 text-[13px]">
                <button type="button" className="text-muted underline underline-offset-2" onClick={() => renameZone(zoneId)}>{t('rename_zone')}</button>
                <button type="button" className="text-negative-ink underline underline-offset-2" onClick={() => deleteZone(zoneId)}>{t('delete_zone')}</button>
              </div>
            )}
          </section>
        )}

        {zoneId ? (
          <section>
            <div className="mb-2 flex items-baseline justify-between px-0.5">
              <h2 className="text-[16px] font-semibold leading-6">{t('elements')}</h2>
              <span className="num text-[13px] text-muted">{done}/{cat.elements.length}</span>
            </div>
            <Track value={done} max={cat.elements.length} className="mb-3" />
            <ul className="panel divide-y divide-rule overflow-hidden">
              {cat.elements.map((el) => {
                const a = zoneAss.find((x) => x.elementId === el)
                return (
                  <li key={el}>
                    <Link to={`/i/${insp.id}/c/${cat.id}/z/${zoneId}/e/${el}`} className="row py-3" onClick={() => touchInspection(insp.id)}>
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-medium">{t(`el.${el}`)}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <ConditionPill c={a?.condition ?? null} />
                          {a?.intervention && <Pill tone={interventionTone[a.intervention]}>{t(`int.${a.intervention}`)}</Pill>}
                          <PriorityPill p={a?.priority ?? null} />
                        </div>
                      </div>
                      <Chevron />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : (
          <Empty text={t('no_zones')} />
        )}
        <button type="button" onClick={() => nav(`/i/${insp.id}/checklist`)} className="btn-secondary w-full">{t('back')}</button>
      </Page>
    </div>
  )
}
