import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../db'
import { useInspection, useAssessments, patchInspection, touchInspection } from '../db/hooks'
import { categoryById } from '../data/checklist'
import { useT } from '../i18n'
import { Page, TopBar } from '../components/Layout'
import { ConditionChip, PriorityBadge, ProgressBar, Empty } from '../components/ui'
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
    await db.transaction('rw', db.assessments, db.photos, db.inspections, async () => {
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
      <Page className="space-y-4">
        {cat.repeatable && (
          <section className="card p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-600">{t('zones')} ({zones.length})</h2>
            </div>
            {zones.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {zones.map((z) => {
                  const zd = (assessments ?? []).filter((a) => a.zoneId === z.id && isAssessed(a)).length
                  const on = z.id === zoneId
                  return (
                    <button key={z.id} type="button" onClick={() => setActiveZone(z.id)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${on ? 'border-brand-900 bg-brand-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
                      {z.label || '—'} <span className={`ml-1 text-xs ${on ? 'text-slate-300' : 'text-slate-400'}`}>{zd}/{cat.elements.length}</span>
                    </button>
                  )
                })}
              </div>
            )}
            <div className="flex gap-2">
              <input className="input" placeholder={t('zone_label_placeholder')} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addZone()} />
              <button type="button" onClick={addZone} className="btn-gold shrink-0 px-4">＋ {t('add')}</button>
            </div>
            {zoneId && (
              <div className="mt-2 flex justify-end gap-3 text-xs">
                <button type="button" className="text-slate-600 underline" onClick={() => renameZone(zoneId)}>{t('rename_zone')}</button>
                <button type="button" className="text-red-600 underline" onClick={() => deleteZone(zoneId)}>{t('delete_zone')}</button>
              </div>
            )}
          </section>
        )}

        {zoneId ? (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-600">{t('elements')}</h2>
              <span className="text-xs text-slate-500">{done}/{cat.elements.length}</span>
            </div>
            <ProgressBar value={done} max={cat.elements.length} className="mb-3" />
            <ul className="space-y-2">
              {cat.elements.map((el) => {
                const a = zoneAss.find((x) => x.elementId === el)
                return (
                  <li key={el}>
                    <Link to={`/i/${insp.id}/c/${cat.id}/z/${zoneId}/e/${el}`} className="card flex items-center gap-3 p-3 hover:bg-slate-50 active:bg-slate-100" onClick={() => touchInspection(insp.id)}>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold">{t(`el.${el}`)}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <ConditionChip c={a?.condition ?? null} />
                          {a?.intervention && <span className="chip bg-slate-100 text-slate-700">{t(`int.${a.intervention}`)}</span>}
                          <PriorityBadge p={a?.priority ?? null} />
                        </div>
                      </div>
                      <span className="text-slate-400">›</span>
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
