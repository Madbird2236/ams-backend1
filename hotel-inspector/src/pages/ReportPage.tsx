import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
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
    <Page className="space-y-4">
      <Section title={t('report')}>
        <div className="space-y-3">
          <div>
            <span className="label">{t('report_language')}</span>
            <div className="grid grid-cols-4 gap-1">
              {LANGS.map((l) => (
                <button key={l} type="button" onClick={() => setRepLang(l)} className={`choice py-3 text-xs ${repLang === l ? 'choice-on' : 'choice-off'}`}>{LANG_NAMES[l]}</button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><input type="checkbox" className="h-5 w-5" checked={withPhotos} onChange={(e) => setWithPhotos(e.target.checked)} /> <span className="text-sm font-medium">{t('include_photos')} ({photos?.length ?? 0})</span></label>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><input type="checkbox" className="h-5 w-5" checked={withBudget} onChange={(e) => setWithBudget(e.target.checked)} /> <span className="text-sm font-medium">{t('include_budget')}</span></label>
          <button type="button" disabled={busy || !photos} onClick={run} className="btn-gold w-full py-4 text-lg">{busy ? t('generating') : `⬇ ${t('generate_pdf')}`}</button>
        </div>
      </Section>

      <Section title={t('rep.1')}>
        <ol className="list-decimal space-y-0.5 pl-5 text-sm text-slate-700">
          {Array.from({ length: 13 }, (_, i) => <li key={i}>{t(`rep.${i + 1}`)}</li>)}
        </ol>
        <p className="mt-3 text-xs text-slate-500">{t('coverage')}: {an.coveragePct}% · {t(`concl.${an.conclusion.kind}`)}</p>
        <p className="mt-2 text-xs text-slate-500">{t('report_disclaimer')}</p>
      </Section>

      <Section title={t('backup')}>
        <button type="button" onClick={() => exportJson([insp.id], `${t('export_json_name')}-${insp.hotel.name || insp.id.slice(0, 6)}`)} className="btn-secondary w-full">{t('export_inspection')}</button>
      </Section>
    </Page>
  )
}
