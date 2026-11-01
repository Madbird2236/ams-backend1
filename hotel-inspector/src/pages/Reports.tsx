import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInspections, useAssessments, useInspectionPhotos } from '../db/hooks'
import { useT } from '../i18n'
import { Page, TopBar } from '../components/Layout'
import { Empty } from '../components/ui'
import { hotelDisplayName } from '../lib/model'
import { fmtDate, uid } from '../lib/ids'
import { deleteInspection, duplicateInspection, exportJson } from '../lib/exportImport'
import { generatePdf } from '../lib/pdf'
import type { Inspection } from '../types'

function Row({ insp }: { insp: Inspection }) {
  const { t, lang } = useT()
  const assessments = useAssessments(insp.id)
  const photos = useInspectionPhotos(insp.id)
  const [busy, setBusy] = useState(false)

  const pdf = async () => {
    if (!assessments || !photos) return
    setBusy(true)
    try { await generatePdf(insp, assessments, photos, { lang, includePhotos: true, includeBudget: true }) } finally { setBusy(false) }
  }

  return (
    <li className="card p-3">
      <Link to={`/i/${insp.id}`} className="block">
        <div className="font-semibold">{hotelDisplayName(insp.hotel, t('untitled_hotel'))}</div>
        <div className="text-xs text-slate-500">{fmtDate(insp.hotel.inspectionDate, lang)} · {insp.hotel.client || '—'} · {assessments?.length ?? 0} {t('elements').toLowerCase()} · {t('photos_count', { n: photos?.length ?? 0 })}</div>
      </Link>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <button type="button" disabled={busy || !assessments} onClick={pdf} className="btn-primary col-span-2 py-2 text-sm">{busy ? t('generating') : t('export_pdf')}</button>
        <button type="button" onClick={() => exportJson([insp.id], `${t('export_json_name')}-${insp.hotel.name || insp.id.slice(0, 6)}`)} className="btn-secondary py-2 text-xs" title={t('export_inspection')}>JSON</button>
        <button type="button" onClick={() => duplicateInspection(insp.id, uid())} className="btn-secondary py-2 text-xs">{t('duplicate')}</button>
      </div>
      <button type="button" onClick={() => confirm(t('delete_confirm')) && deleteInspection(insp.id)} className="mt-2 w-full text-xs text-red-600 underline">{t('delete_inspection')}</button>
    </li>
  )
}

export default function Reports() {
  const { t } = useT()
  const inspections = useInspections()
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title={t('reports')} subtitle={t('company')} back="/" />
      <Page>
        {inspections && inspections.length === 0 ? <Empty text={t('no_inspections')} /> : (
          <ul className="space-y-3">{inspections?.map((i) => <Row key={i.id} insp={i} />)}</ul>
        )}
      </Page>
    </div>
  )
}
