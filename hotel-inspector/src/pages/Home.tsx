import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FileText, FilePdf, DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import { db, requestPersistentStorage } from '../db'
import { useInspections } from '../db/hooks'
import { useT } from '../i18n'
import { Brand, Page } from '../components/Layout'
import { LangSwitcher, Empty, Pill, Chevron } from '../components/ui'
import { newInspection, hotelDisplayName } from '../lib/model'
import { fmtDate } from '../lib/ids'
import { exportJson, importBundle, isBundle } from '../lib/exportImport'

export default function Home() {
  const { t, lang } = useT()
  const nav = useNavigate()
  const inspections = useInspections()
  const fileRef = useRef<HTMLInputElement>(null)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { requestPersistentStorage().then(setPersisted) }, [])

  const create = async () => {
    const insp = newInspection(lang)
    await db.inspections.add(insp)
    nav(`/i/${insp.id}`)
  }

  const onImport = async (f: File | undefined) => {
    if (!f) return
    try {
      const json = JSON.parse(await f.text())
      if (!isBundle(json)) throw new Error('invalid')
      if (!confirm(t('import_confirm'))) return
      const n = await importBundle(json)
      setMsg(t('import_done', { n }))
    } catch {
      setMsg(t('import_failed'))
    } finally {
      if (fileRef.current) fileRef.current.value = ''
      setTimeout(() => setMsg(null), 5000)
    }
  }

  const lastDraft = (inspections ?? []).find((i) => i.status === 'draft')
  const hasAny = !!inspections?.length

  return (
    <div className="flex min-h-full flex-col">
      <header className="safe-top">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Brand />
          <LangSwitcher />
        </div>
      </header>
      <Page>
        {/* Title row: the screen's noun and its one job */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-[24px] font-semibold leading-8">{t('recent_inspections')}</h1>
          <button type="button" onClick={create} className="btn-primary shrink-0">
            <Plus size={18} weight="bold" aria-hidden /> {t('new_inspection')}
          </button>
        </div>

        {lastDraft && (
          <Link to={`/i/${lastDraft.id}/checklist`} className="panel row mb-4 justify-between border-accent/60 bg-accent-soft/40">
            <div className="min-w-0">
              <div className="text-[13px] text-muted">{t('continue_inspection')}</div>
              <div className="truncate text-[15px] font-semibold">{hotelDisplayName(lastDraft.hotel, t('untitled_hotel'))}</div>
            </div>
            <Chevron />
          </Link>
        )}

        {inspections === undefined ? null : inspections.length === 0 ? (
          <Empty text={t('no_inspections')} action={<button type="button" onClick={create} className="btn-secondary"><Plus size={16} aria-hidden /> {t('new_inspection')}</button>} />
        ) : (
          <ul className="panel divide-y divide-rule overflow-hidden">
            {inspections.map((i) => (
              <li key={i.id}>
                <Link to={`/i/${i.id}`} className="row py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-semibold">{hotelDisplayName(i.hotel, t('untitled_hotel'))}</span>
                      <Pill tone={i.status === 'completed' ? 'positive' : 'neutral'}>{i.status === 'completed' ? t('status_completed') : t('status_draft')}</Pill>
                    </div>
                    <div className="mt-0.5 truncate text-[13px] text-muted">
                      {[i.hotel.address, i.hotel.region, i.hotel.country].filter(Boolean).join(', ') || '—'}
                    </div>
                  </div>
                  <span className="num text-[13px] text-muted">{fmtDate(i.hotel.inspectionDate || i.updatedAt, lang)}</span>
                  <Chevron />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {msg && <p className="mt-4 rounded-[var(--radius-card)] border border-warning-border bg-warning-bg px-3 py-2 text-[13px] text-warning" role="status">{msg}</p>}

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Link to="/reports" className="btn-secondary"><FileText size={18} aria-hidden /> {t('reports')}</Link>
          <button type="button" disabled={!hasAny} onClick={() => nav('/reports')} className="btn-secondary"><FilePdf size={18} aria-hidden /> {t('export_pdf')}</button>
          <button type="button" disabled={!hasAny} onClick={() => exportJson(undefined, `${t('export_json_name')}-${new Date().toISOString().slice(0, 10)}`)} className="btn-secondary"><DownloadSimple size={18} aria-hidden /> {t('backup')}</button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary"><UploadSimple size={18} aria-hidden /> {t('import_backup')}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
        </div>

        <footer className="mt-8 space-y-1 text-[12px] leading-4 text-muted">
          <p>{t('storage_notice')}</p>
          {persisted !== null && <p className={persisted ? 'text-positive' : 'text-warning'}>{persisted ? t('storage_persisted') : t('storage_not_persisted')}</p>}
          <p>{t('company')} · <a className="underline underline-offset-2" href={t('website')} target="_blank" rel="noreferrer">ams.swiss</a></p>
        </footer>
      </Page>
    </div>
  )
}
