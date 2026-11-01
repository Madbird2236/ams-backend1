import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FilePdf, DownloadSimple } from '@phosphor-icons/react'
import type { Assessment, Inspection, Lang } from '../types'
import { useInspectionPhotos } from '../db/hooks'
import { useT, LANGS, LANG_NAMES } from '../i18n'
import { Page } from '../components/Layout'
import { Section } from '../components/ui'
import { generatePdf } from '../lib/pdf'
import { exportJson } from '../lib/exportImport'
import { analyze } from '../lib/analysis'

type Ctx = { insp: Inspection; assessments: Assessment[] }

export default function ReportPage() {
  const { insp, assessments } = useOutletContext<Ctx>()
  const { t, lang } = useT()
  const photos = useInspectionPhotos(insp.id)
  const [repLang, setRepLang] = useState<Lang>(lang)
  const [withPhotos, setWithPhotos] = useState(true)
  const [withBudget, setWithBudget] = useState(true)
  const [busy, setBusy] = useState(false)
  const an = analyze(insp, assessments, t)

  const run = async () => {
    if (!photos) return
    setBusy(true)
    try { await generatePdf(insp, assessments, photos, { lang: repLang, includePhotos: withPhotos, includeBudget: withBudget }) } finally { setBusy(false) }
  }

  return (
    <Page className="space-y-5">
      <Section title={t('report')}>
        <div className="space-y-4">
          <div>
            <span className="label">{t('report_language')}</span>
            <div className="inline-flex w-full rounded-[var(--radius-control)] border border-control p-0.5" role="group">
              {LANGS.map((l) => (
                <button key={l} type="button" onClick={() => setRepLang(l)} aria-pressed={repLang === l} className={`press flex-1 rounded-[4px] min-h-10 text-[13px] font-medium ${repLang === l ? 'bg-ink text-white' : 'text-muted'}`}>{LANG_NAMES[l]}</button>
              ))}
            </div>
          </div>
          <label className="flex min-h-11 items-center gap-3 text-[15px]"><input type="checkbox" className="h-5 w-5" checked={withPhotos} onChange={(e) => setWithPhotos(e.target.checked)} /> {t('include_photos')} <span className="num text-muted">({photos?.length ?? 0})</span></label>
          <label className="flex min-h-11 items-center gap-3 text-[15px]"><input type="checkbox" className="h-5 w-5" checked={withBudget} onChange={(e) => setWithBudget(e.target.checked)} /> {t('include_budget')}</label>
          <button type="button" disabled={busy || !photos} onClick={run} className="btn-primary w-full min-h-12 text-[16px]"><FilePdf size={20} aria-hidden /> {busy ? t('generating') : t('generate_pdf')}</button>
          <p className="num text-[13px] text-muted">{t('coverage')} {an.coveragePct}% · {t(`concl.${an.conclusion.kind}`)}</p>
        </div>
      </Section>

      <Section title={t('rep.1')}>
        <ol className="list-decimal space-y-1 pl-5 text-[14px] leading-5">
          {Array.from({ length: 13 }, (_, i) => <li key={i}>{t(`rep.${i + 1}`)}</li>)}
        </ol>
        <p className="mt-3 text-[12px] leading-4 text-muted">{t('report_disclaimer')}</p>
      </Section>

      <Section title={t('backup')}>
        <button type="button" onClick={() => exportJson([insp.id], `${t('export_json_name')}-${insp.hotel.name || insp.id.slice(0, 6)}`)} className="btn-secondary w-full"><DownloadSimple size={18} aria-hidden /> {t('export_inspection')}</button>
      </Section>
    </Page>
  )
}
