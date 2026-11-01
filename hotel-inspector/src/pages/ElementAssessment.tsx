import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Images, Trash, CaretLeft, CaretRight, Check } from '@phosphor-icons/react'
import { db } from '../db'
import { useInspection, useAssessment, usePhotos, touchInspection } from '../db/hooks'
import { categoryById, TRADES, UNITS } from '../data/checklist'
import { useT } from '../i18n'
import { Page, TopBar } from '../components/Layout'
import { ChoiceGroup, Field, Section, conditionTone, priorityTone, interventionTone } from '../components/ui'
import { emptyAssessment, suggestFromCondition } from '../lib/model'
import { processPhoto } from '../lib/photos'
import { uid } from '../lib/ids'
import { CONDITIONS, CONFIDENCES, INTERVENTIONS, PRIORITIES, type Assessment, type Condition, type Photo } from '../types'

function PhotoThumb({ p, onDelete, onCaption }: { p: Photo; onDelete: () => void; onCaption: (c: string) => void }) {
  const { t } = useT()
  const [url, setUrl] = useState<string>('')
  useEffect(() => {
    const u = URL.createObjectURL(p.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [p.blob])
  return (
    <figure className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-raised">
      <img src={url} alt={p.caption || ''} className="aspect-[4/3] w-full object-cover" />
      <figcaption className="flex items-center gap-2 p-2">
        <input className="input min-h-10 text-[14px]" placeholder={t('photo_caption')} defaultValue={p.caption} onBlur={(e) => onCaption(e.target.value)} aria-label={t('photo_caption')} />
        <button type="button" onClick={onDelete} className="btn-ghost min-h-10 w-10 shrink-0 px-0 text-negative-ink" aria-label={t('delete_photo')}><Trash size={18} aria-hidden /></button>
      </figcaption>
    </figure>
  )
}

export default function ElementAssessment() {
  const { id, catId, zoneId, elementId } = useParams()
  const nav = useNavigate()
  const { t } = useT()
  const insp = useInspection(id)
  const stored = useAssessment(id, zoneId, elementId)
  const cat = categoryById(catId ?? '')
  const [draft, setDraft] = useState<Assessment | null>(null)
  const photos = usePhotos(draft?.id)
  const fileRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !catId || !zoneId || !elementId || stored === undefined) return
    if (stored) { setDraft((d) => (d && d.id === stored.id ? d : stored)); return }
    setDraft(emptyAssessment(id, catId, zoneId, elementId))
  }, [id, catId, zoneId, elementId, stored])

  useEffect(() => {
    if (!draft) return
    const h = setTimeout(async () => {
      await db.assessments.put({ ...draft, updatedAt: Date.now() })
      await touchInspection(draft.inspectionId)
    }, 350)
    return () => clearTimeout(h)
  }, [draft])

  if (!insp || !cat || !draft || !elementId) return null
  const zone = insp.zones.find((z) => z.id === zoneId)
  const idx = cat.elements.indexOf(elementId)
  const prevEl = cat.elements[idx - 1]
  const nextEl = cat.elements[idx + 1]
  const base = `/i/${insp.id}/c/${cat.id}/z/${zoneId}/e/`

  const upd = (p: Partial<Assessment>) => setDraft((d) => (d ? { ...d, ...p } : d))

  const setCondition = (c: Condition | null) => {
    if (!c) { upd({ condition: null, intervention: null, priority: null, suggested: false }); return }
    const s = suggestFromCondition(c)
    if (draft.suggested || draft.intervention === null) upd({ condition: c, intervention: s.intervention, priority: s.priority, suggested: true })
    else upd({ condition: c })
  }

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true); setErr(null)
    try {
      await db.assessments.put({ ...draft, updatedAt: Date.now() })
      for (const f of Array.from(files)) {
        const blob = await processPhoto(f)
        await db.photos.add({ id: uid(), inspectionId: draft.inspectionId, assessmentId: draft.id, blob, caption: '', createdAt: Date.now() })
      }
      await touchInspection(draft.inspectionId)
    } catch {
      setErr(t('photo_too_large'))
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
      if (camRef.current) camRef.current.value = ''
    }
  }

  const clearAll = async () => {
    if (!confirm(t('clear_assessment_confirm'))) return
    await db.photos.where('assessmentId').equals(draft.id).delete()
    await db.assessments.delete(draft.id)
    setDraft(emptyAssessment(draft.inspectionId, draft.categoryId, draft.zoneId, draft.elementId))
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title={t(`el.${elementId}`)}
        subtitle={`${cat.code}. ${t(`cat.${cat.id}`)}${zone?.label ? ` · ${zone.label}` : ''} · ${idx + 1}/${cat.elements.length}`}
        back={`/i/${insp.id}/c/${cat.id}`}
      />
      <Page className="space-y-5">
        <Section title={t('condition')}>
          <ChoiceGroup options={CONDITIONS} value={draft.condition} onChange={setCondition} render={(c) => t(`cond.${c}`)} toneFor={(c) => conditionTone[c]} />
        </Section>

        <Section title={t('intervention')} right={draft.suggested && draft.intervention ? <span className="text-accent">{t('suggested_hint')}</span> : undefined}>
          <ChoiceGroup options={INTERVENTIONS} value={draft.intervention} onChange={(v) => upd({ intervention: v, suggested: false })} render={(v) => t(`int.${v}`)} toneFor={(v) => interventionTone[v]} />
        </Section>

        <Section title={t('priority')}>
          <ChoiceGroup options={PRIORITIES} value={draft.priority} onChange={(v) => upd({ priority: v, suggested: false })} render={(p) => t(`prio.${p}`)} columns={1} toneFor={(p) => priorityTone[p]} />
        </Section>

        <Section title={t('photos')} right={t('photos_count', { n: photos?.length ?? 0 })}>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={busy} onClick={() => camRef.current?.click()} className="btn-primary min-h-12"><Camera size={20} aria-hidden /> {t('take_photo')}</button>
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="btn-secondary min-h-12"><Images size={20} aria-hidden /> {t('add_photo')}</button>
            <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => addPhotos(e.target.files)} />
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
          </div>
          {err && <p className="mt-2 text-[13px] text-negative" role="alert">{err}</p>}
          {photos && photos.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {photos.map((p) => (
                <PhotoThumb key={p.id} p={p} onDelete={() => db.photos.delete(p.id)} onCaption={(c) => db.photos.update(p.id, { caption: c })} />
              ))}
            </div>
          )}
        </Section>

        <Section title={t('description')}>
          <textarea className="input min-h-24" value={draft.description} onChange={(e) => upd({ description: e.target.value })} aria-label={t('description')} />
          <div className="mt-4">
            <Field label={t('observations')}><textarea className="input min-h-20" value={draft.notes} onChange={(e) => upd({ notes: e.target.value })} /></Field>
          </div>
        </Section>

        <Section title={`${t('dimensions')} · ${t('quantity')}`}>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('dimensions')}><input className="input" value={draft.dimensions} onChange={(e) => upd({ dimensions: e.target.value })} placeholder="3.2 × 2.6 m" /></Field>
            <div className="grid grid-cols-5 gap-2">
              <div className="col-span-3"><Field label={t('quantity')}><input className="input num" inputMode="decimal" value={draft.quantity} onChange={(e) => upd({ quantity: e.target.value })} /></Field></div>
              <div className="col-span-2"><Field label={t('unit')}>
                <select className="input" value={draft.unit} onChange={(e) => upd({ unit: e.target.value })}>
                  <option value=""></option>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field></div>
            </div>
            <div className="col-span-2"><Field label={t('materials')}><input className="input" value={draft.materials} onChange={(e) => upd({ materials: e.target.value })} /></Field></div>
            <div className="col-span-2"><Field label={t('trade')}>
              <select className="input" value={draft.trade} onChange={(e) => upd({ trade: e.target.value })}>
                <option value="">{t('select_trade')}</option>
                {TRADES.map((tr) => <option key={tr} value={tr}>{t(`trade.${tr}`)}</option>)}
              </select>
            </Field></div>
            <Field label={`${t('cost_estimate')} (${insp.budget.currency})`}><input className="input num" inputMode="decimal" value={draft.costEstimate} onChange={(e) => upd({ costEstimate: e.target.value })} placeholder="0" /></Field>
            <Field label={t('confidence')}>
              <div className="grid grid-cols-3 gap-1.5">
                {CONFIDENCES.map((c) => (
                  <button key={c} type="button" onClick={() => upd({ confidence: draft.confidence === c ? null : c })} aria-pressed={draft.confidence === c} className="choice choice-neutral min-h-11 text-[13px]">{t(`conf.${c}`)}</button>
                ))}
              </div>
            </Field>
          </div>
        </Section>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={!prevEl} onClick={() => nav(base + prevEl)} className="btn-secondary min-h-12"><CaretLeft size={18} aria-hidden /> {t('prev_element')}</button>
          {nextEl ? (
            <button type="button" onClick={() => nav(base + nextEl)} className="btn-primary min-h-12">{t('next_element')} <CaretRight size={18} aria-hidden /></button>
          ) : (
            <button type="button" onClick={() => nav(`/i/${insp.id}/c/${cat.id}`)} className="btn-primary min-h-12"><Check size={18} aria-hidden /> {t('close')}</button>
          )}
        </div>
        <div className="flex items-center justify-between text-[12px] text-muted">
          <span>{t('saved')}</span>
          <button type="button" onClick={clearAll} className="text-negative-ink underline underline-offset-2">{t('clear_assessment')}</button>
        </div>
      </Page>
    </div>
  )
}
