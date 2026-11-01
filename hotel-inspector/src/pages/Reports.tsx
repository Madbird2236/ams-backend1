import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FilePdf, DownloadSimple, Copy } from '@phosphor-icons/react'
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
    <li className="px-4 py-3">
      <Link to={`/i/${insp.id}`} className="block">
        <div className="text-[15px] font-semibold">{hotelDisplayName(insp.hotel, t('untitled_hotel'))}</div>
        <div className="num mt-0.5 text-[13px] text-muted">{fmtDate(insp.hotel.inspectionDate, lang)} · {insp.hotel.client || '—'} · {t('photos_count', { n: photos?.length ?? 0 })}</div>
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy || !assessments} onClick={pdf} className="btn-primary min-h-10 px-3 text-[14px]"><FilePdf size={16} aria-hidden /> {busy ? t('generating') : t('export_pdf')}</button>
        <button type="button" onClick={() => exportJson([insp.id], `${t('export_json_name')}-${insp.hotel.name || insp.id.slice(0, 6)}`)} className="btn-secondary min-h-10 px-3 text-[14px]" title={t('export_inspection')}><DownloadSimple size={16} aria-hidden /> JSON</button>
        <button type="button" onClick={() => duplicateInspection(insp.id, uid())} className="btn-secondary min-h-10 px-3 text-[14px]"><Copy size={16} aria-hidden /> {t('duplicate')}</button>
        <button type="button" onClick={() => confirm(t('delete_confirm')) && deleteInspection(insp.id)} className="btn-ghost ml-auto min-h-10 px-2 text-[14px] text-negative-ink">{t('delete_inspection')}</button>
      </div>
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
          <ul className="panel divide-y divide-rule">{inspections?.map((i) => <Row key={i.id} insp={i} />)}</ul>
        )}
      </Page>
    </div>
  )
}
