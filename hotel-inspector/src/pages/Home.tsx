import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db, requestPersistentStorage } from '../db'
import { useInspections } from '../db/hooks'
import { useT } from '../i18n'
import { Brand, Page } from '../components/Layout'
import { LangSwitcher, Empty } from '../components/ui'
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

  const drafts = (inspections ?? []).filter((i) => i.status === 'draft')
  const lastDraft = drafts[0]

  return (
    <div className="flex min-h-full flex-col">
      <header className="bg-brand-900 text-white safe-top">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
          <Brand light />
          <LangSwitcher />
        </div>
      </header>
      <Page>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={create} className="btn-gold col-span-2 h-20 text-lg">
            <span className="text-2xl">＋</span> {t('new_inspection')}
          </button>
          <button type="button" disabled={!lastDraft} onClick={() => lastDraft && nav(`/i/${lastDraft.id}/checklist`)} className="btn-primary h-20 flex-col gap-1 text-sm">
            <span className="text-xl">▶</span> {t('continue_inspection')}
          </button>
          <Link to="/reports" className="btn-primary h-20 flex-col gap-1 text-sm">
            <span className="text-xl">📑</span> {t('reports')}
          </Link>
          <button type="button" disabled={!inspections?.length} onClick={() => nav('/reports')} className="btn-secondary h-16 flex-col gap-0.5 text-sm">
            <span className="text-lg">⬇</span> {t('export_pdf')}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={!inspections?.length} onClick={() => exportJson(undefined, `${t('export_json_name')}-${new Date().toISOString().slice(0, 10)}`)} className="btn-secondary h-16 flex-col gap-0.5 px-2 text-xs">
              <span className="text-lg">💾</span> {t('backup')}
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary h-16 flex-col gap-0.5 px-2 text-xs">
              <span className="text-lg">📥</span> {t('import_backup')}
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
          </div>
        </div>

        {msg && <div className="mt-3 rounded-xl border border-gold-500 bg-amber-50 p-3 text-sm text-slate-800">{msg}</div>}

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-600">{t('recent_inspections')}</h2>
          {inspections === undefined ? null : inspections.length === 0 ? (
            <Empty text={t('no_inspections')} />
          ) : (
            <ul className="space-y-2">
              {inspections.map((i) => (
                <li key={i.id}>
                  <Link to={`/i/${i.id}`} className="card flex items-center gap-3 p-3 hover:bg-slate-50 active:bg-slate-100">
                    <div className={`h-10 w-1.5 rounded-full ${i.status === 'completed' ? 'bg-emerald-500' : 'bg-gold-500'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{hotelDisplayName(i.hotel, t('untitled_hotel'))}</div>
                      <div className="truncate text-xs text-slate-500">
                        {[i.hotel.address, i.hotel.region, i.hotel.country].filter(Boolean).join(', ') || '—'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {t('updated')}: {fmtDate(i.updatedAt, lang)} · {i.status === 'completed' ? t('status_completed') : t('status_draft')}
                      </div>
                    </div>
                    <span className="text-slate-400">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-8 space-y-1 text-center text-xs text-slate-400">
          <p>{t('storage_notice')}</p>
          {persisted !== null && <p className={persisted ? 'text-emerald-600' : 'text-amber-600'}>{persisted ? t('storage_persisted') : t('storage_not_persisted')}</p>}
          <p>{t('company')} · <a className="underline" href={t('website')} target="_blank" rel="noreferrer">ams.swiss</a></p>
        </footer>
      </Page>
    </div>
  )
}
