import { jsPDF } from 'jspdf'
import autoTable, { type RowInput } from 'jspdf-autotable'
import type { Assessment, Inspection, Lang, Photo } from '../types'
import { makeT, type TFn } from '../i18n'
import { analyze, sortByPriority } from './analysis'
import { computeBudget, BUCKETS } from './budget'
import { CATEGORIES, categoryById } from '../data/checklist'
import { fmtDate, fmtMoney, parseNum } from './ids'
import { zoneLabel } from './model'
import { blobToDataUrl, imageSize } from './photos'

export interface PdfOptions { lang: Lang; includePhotos: boolean; includeBudget: boolean }

const NAVY: [number, number, number] = [15, 23, 42]
const GOLD: [number, number, number] = [199, 167, 107]
const GREY: [number, number, number] = [100, 116, 139]
const LIGHT: [number, number, number] = [241, 245, 249]
const PRIO_FILL: Record<string, [number, number, number]> = { P0: [196, 36, 42], P1: [255, 237, 234], P2: [255, 251, 235], P3: [232, 240, 250] }
const PRIO_INK: Record<string, [number, number, number]> = { P0: [255, 255, 255], P1: [131, 28, 30], P2: [146, 64, 14], P3: [15, 47, 90] }

const PAGE_W = 210
const PAGE_H = 297
const M = 16
const CONTENT_W = PAGE_W - 2 * M

class Doc {
  doc: jsPDF
  y = M
  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  }
  newPage() { this.doc.addPage(); this.y = M + 8 }
  ensure(h: number) { if (this.y + h > PAGE_H - M - 8) this.newPage() }
  h1(text: string) {
    this.ensure(18)
    this.doc.setFillColor(...GOLD)
    this.doc.rect(M, this.y, 2.5, 9, 'F')
    this.doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(...NAVY)
    this.doc.text(text, M + 6, this.y + 7)
    this.y += 14
  }
  h2(text: string) {
    this.ensure(12)
    this.doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...NAVY)
    this.doc.text(text, M, this.y + 5)
    this.y += 9
  }
  para(text: string, opts: { size?: number; color?: [number, number, number]; bold?: boolean; indent?: number } = {}) {
    const size = opts.size ?? 9.5
    this.doc.setFont('helvetica', opts.bold ? 'bold' : 'normal').setFontSize(size).setTextColor(...(opts.color ?? [30, 41, 59]))
    const w = CONTENT_W - (opts.indent ?? 0)
    const lines = this.doc.splitTextToSize(text, w) as string[]
    const lh = size * 0.42
    for (const line of lines) {
      this.ensure(lh + 1)
      this.doc.text(line, M + (opts.indent ?? 0), this.y + lh)
      this.y += lh + 0.6
    }
    this.y += 1.5
  }
  bullets(items: string[]) {
    for (const it of items) {
      this.doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(30, 41, 59)
      const lines = this.doc.splitTextToSize(it, CONTENT_W - 6) as string[]
      const lh = 4
      this.ensure(lines.length * lh + 1)
      this.doc.circle(M + 1.5, this.y + 2.6, 0.7, 'F')
      lines.forEach((l, i) => this.doc.text(l, M + 5, this.y + lh * (i + 1) - 0.4))
      this.y += lines.length * lh + 1
    }
    this.y += 1.5
  }
  table(head: string[], body: RowInput[], colStyles?: Record<number, { cellWidth?: number | 'auto' | 'wrap'; halign?: 'left' | 'right' | 'center' }>, didParseCell?: (data: { section: string; column: { index: number }; cell: { raw: unknown; styles: { fillColor?: unknown; textColor?: unknown; fontStyle?: string } } }) => void) {
    this.ensure(20)
    autoTable(this.doc, {
      startY: this.y,
      head: [head],
      body,
      margin: { left: M, right: M, top: M + 8, bottom: M + 8 },
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.8, textColor: [30, 41, 59], lineColor: [226, 232, 240], lineWidth: 0.2, overflow: 'linebreak' },
      headStyles: { fillColor: [255, 255, 255], textColor: GREY, fontStyle: 'normal', lineWidth: { bottom: 0.5 }, lineColor: [20, 20, 20] },
      columnStyles: colStyles as never,
      didParseCell: didParseCell as never,
    })
    this.y = ((this.doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? this.y) + 5
  }
  box(text: string, fill: [number, number, number], textColor: [number, number, number] = NAVY) {
    this.doc.setFont('helvetica', 'bold').setFontSize(11)
    const lines = this.doc.splitTextToSize(text, CONTENT_W - 10) as string[]
    const h = lines.length * 5.5 + 6
    this.ensure(h + 2)
    this.doc.setFillColor(...fill)
    this.doc.roundedRect(M, this.y, CONTENT_W, h, 2, 2, 'F')
    this.doc.setTextColor(...textColor)
    lines.forEach((l, i) => this.doc.text(l, M + 5, this.y + 6 + i * 5.5))
    this.y += h + 4
  }
  kv(rows: Array<[string, string]>) {
    const colW = CONTENT_W / 2
    let col = 0
    for (const [k, v] of rows) {
      if (col === 0) this.ensure(9)
      const x = M + col * colW
      this.doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...GREY)
      this.doc.text(k.toUpperCase(), x, this.y + 3)
      this.doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(...NAVY)
      this.doc.text(this.doc.splitTextToSize(v || '—', colW - 4)[0] as string, x, this.y + 7.5)
      col = (col + 1) % 2
      if (col === 0) this.y += 10
    }
    if (col === 1) this.y += 10
    this.y += 2
  }
}

function labelOf(insp: Inspection, a: Assessment, t: TFn) {
  return `${zoneLabel(insp, a.zoneId, t(`cat.${a.categoryId}`))} — ${t(`el.${a.elementId}`)}`
}

export async function generatePdf(insp: Inspection, assessments: Assessment[], photos: Photo[], opts: PdfOptions): Promise<void> {
  const t = makeT(opts.lang)
  const lang = opts.lang
  const d = new Doc()
  const doc = d.doc
  const an = analyze(insp, assessments, t)
  const h = insp.hotel
  const cur = insp.budget.currency
  const money = (n: number) => fmtMoney(n, cur, lang)
  const hotelName = h.name.trim() || t('untitled_hotel')
  const location = [h.address, h.region, h.country].filter(Boolean).join(', ')
  const unk = (key: string, v: string) => (h.unknownFields.includes(key) ? t('rep_characteristics_unknown') : v || t('rep_not_provided'))
  const ynu = (v: string) => (v === 'yes' ? t('yes') : v === 'no' ? t('no') : t('unknown'))

  // ---------- COVER
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, PAGE_W, 120, 'F')
  doc.setFillColor(...GOLD)
  doc.rect(0, 120, PAGE_W, 2.5, 'F')
  doc.setTextColor(255).setFont('helvetica', 'bold').setFontSize(26)
  doc.text(t('app_title'), M, 48)
  doc.setFont('helvetica', 'normal').setFontSize(13).setTextColor(...GOLD)
  doc.text(t('report_cover_title'), M, 58)
  doc.setFontSize(9.5).setTextColor(203, 213, 225)
  doc.text(t('app_subtitle'), M, 66)
  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(255)
  const nameLines = doc.splitTextToSize(hotelName, CONTENT_W) as string[]
  nameLines.slice(0, 2).forEach((l, i) => doc.text(l, M, 92 + i * 9))
  doc.setFont('helvetica', 'normal').setFontSize(10.5).setTextColor(203, 213, 225)
  if (location) doc.text(doc.splitTextToSize(location, CONTENT_W)[0] as string, M, 92 + nameLines.slice(0, 2).length * 9 + 2)

  d.y = 140
  d.kv([
    [t('report_hotel'), hotelName],
    [t('report_location'), location || t('rep_not_provided')],
    [t('report_date'), fmtDate(h.inspectionDate, lang)],
    [t('report_prepared_for'), h.client || t('rep_not_provided')],
    [t('report_inspector'), h.inspector || t('rep_not_provided')],
    [t('h_owner'), unk('owner', h.owner)],
  ])
  d.y = 232
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GREY)
  const disc = doc.splitTextToSize(t('report_disclaimer'), CONTENT_W) as string[]
  disc.forEach((l, i) => doc.text(l, M, d.y + i * 3.6))
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...NAVY)
  doc.text(t('company'), M, 278)
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...GREY)
  doc.text(t('website'), M, 283)

  // ---------- 1. Executive summary
  d.newPage()
  d.h1(`1. ${t('rep.1')}`)
  d.para(t('rep_exec_text', {
    name: hotelName, date: fmtDate(h.inspectionDate, lang), a: an.assessedCount, b: an.totalSlots, p: an.coveragePct,
    p0: an.critical.length, req: an.required.length, rec: an.recommended.length, opt: an.optional.length,
    spec: an.specialist.filter((a) => a.intervention === 'specialist').length, nv: an.notVerified.length,
  }))
  const conclFill: Record<string, [number, number, number]> = { well_preserved: [209, 250, 229], partial: [254, 243, 199], deep: [254, 226, 226], insufficient: LIGHT }
  d.box(`${t('conclusion')}: ${t(`concl.${an.conclusion.kind}`)}`, conclFill[an.conclusion.kind])
  if (opts.includeBudget) {
    const b = computeBudget(insp, assessments)
    if (b.lines.length) {
      d.table(
        [t('budget'), cur],
        [
          [t('bucket_required'), money(b.byBucket.required)],
          [t('bucket_recommended'), money(b.byBucket.recommended)],
          [t('bucket_optional'), money(b.byBucket.optional)],
          [`${t('total_contingency')} (${insp.budget.contingencyPct}%)`, money(b.contingency)],
          ...(insp.budget.taxPct ? [[`${t('total_tax')} (${insp.budget.taxPct}%)`, money(b.tax)] as RowInput] : []),
          [{ content: t('total_all'), styles: { fontStyle: 'bold' } }, { content: money(b.total), styles: { fontStyle: 'bold' } }],
        ],
        { 1: { halign: 'right', cellWidth: 45 } },
      )
    }
  }

  // ---------- 2. Property characteristics
  d.h1(`2. ${t('rep.2')}`)
  d.kv([
    [t('h_year_built'), unk('yearBuilt', h.yearBuilt)],
    [t('h_year_renovated'), unk('yearRenovated', h.yearRenovated)],
    [t('h_area'), unk('areaM2', h.areaM2)],
    [t('h_floors'), unk('floors', h.floors)],
    [t('h_rooms'), unk('rooms', h.rooms)],
    [t('h_bathrooms'), unk('bathrooms', h.bathrooms)],
    [t('h_beds'), unk('beds', h.beds)],
    [t('h_basement'), ynu(h.hasBasement)],
    [t('h_restaurant'), ynu(h.hasRestaurant)],
    [t('h_pro_kitchen'), ynu(h.hasProKitchen)],
    [t('h_elevator'), ynu(h.hasElevator)],
    [t('h_parking'), ynu(h.hasParking)],
    [t('h_pool_spa'), ynu(h.hasPoolSpa)],
  ])
  if (h.notes) d.para(h.notes, { color: GREY })
  if (/ital|itália|italia|^it$/i.test(h.country)) d.para(t('italy_notice'), { size: 8, color: GREY })

  // ---------- 3. Overall condition by category
  d.h1(`3. ${t('rep.3')}`)
  d.table(
    [t('rep_table_area'), t('rep_table_assessed'), t('rep_table_good'), t('rep_table_repair'), t('rep_table_replace'), t('rep_table_unverified'), t('rep_table_required'), 'P0'],
    an.byCategory.map((c) => [`${categoryById(c.categoryId)!.code}. ${t(`cat.${c.categoryId}`)}`, `${c.assessed}/${c.total}`, c.good, c.repair, c.replace, c.unverified, c.required, c.p0]),
    { 0: { cellWidth: 58 }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center' }, 6: { halign: 'center' }, 7: { halign: 'center' } },
  )

  const prioCell = (data: { section: string; column: { index: number }; cell: { raw: unknown; styles: { fillColor?: unknown; textColor?: unknown; fontStyle?: string } } }) => {
    if (data.section === 'body' && data.column.index === 0 && typeof data.cell.raw === 'string' && PRIO_FILL[data.cell.raw]) {
      data.cell.styles.fillColor = PRIO_FILL[data.cell.raw]
      data.cell.styles.textColor = PRIO_INK[data.cell.raw]
      data.cell.styles.fontStyle = 'bold'
    }
  }
  const itemRows = (list: Assessment[]) =>
    sortByPriority(list).map((a) => [
      a.priority ?? '—',
      labelOf(insp, a, t),
      a.condition ? t(`cond.${a.condition}`) : '—',
      [a.description, a.notes].filter(Boolean).join(' · ') || '—',
      a.trade ? t(`trade.${a.trade}`) : '—',
      parseNum(a.costEstimate) !== null ? `${money(parseNum(a.costEstimate)!)}${insp.budget.assumptionFlags[a.id] ? ' *' : ''}` : '—',
    ])
  const itemHead = [t('rep_table_priority'), t('rep_table_element'), t('rep_table_condition'), t('description'), t('rep_table_trade'), t('rep_table_cost')]
  const itemCols = { 0: { cellWidth: 17, halign: 'center' as const }, 1: { cellWidth: 48 }, 2: { cellWidth: 24 }, 3: { cellWidth: 'auto' as const }, 4: { cellWidth: 26 }, 5: { cellWidth: 22, halign: 'right' as const } }

  // ---------- 4. Critical issues
  d.h1(`4. ${t('rep.4')}`)
  if (an.critical.length) d.table(itemHead, itemRows(an.critical), itemCols, prioCell); else d.para(t('no_items'), { color: GREY })

  // ---------- 5. Assessment by area (all assessed elements)
  d.h1(`5. ${t('rep.5')}`)
  for (const cat of CATEGORIES) {
    const zones = insp.zones.filter((z) => z.categoryId === cat.id)
    for (const z of zones) {
      const rows = cat.elements.map((el) => {
        const a = assessments.find((x) => x.zoneId === z.id && x.elementId === el)
        return [
          t(`el.${el}`),
          a?.condition ? t(`cond.${a.condition}`) : t('not_assessed'),
          a?.intervention ? t(`int.${a.intervention}`) : '—',
          a?.priority ?? '—',
          a?.confidence ? t(`conf.${a.confidence}`) : '—',
          a?.description || '—',
        ]
      })
      const assessedHere = rows.some((r) => r[1] !== t('not_assessed'))
      if (!assessedHere && cat.repeatable) continue
      d.h2(`${cat.code}. ${t(`cat.${cat.id}`)}${z.label ? ` — ${z.label}` : ''}`)
      d.table(
        [t('rep_table_element'), t('rep_table_condition'), t('rep_table_intervention'), t('rep_table_priority'), t('rep_table_confidence'), t('description')],
        rows,
        { 0: { cellWidth: 34 }, 1: { cellWidth: 28 }, 2: { cellWidth: 30 }, 3: { cellWidth: 18, halign: 'center' }, 4: { cellWidth: 20 }, 5: { cellWidth: 'auto' } },
        (data) => {
          if (data.section === 'body' && data.column.index === 3 && typeof data.cell.raw === 'string' && PRIO_FILL[data.cell.raw]) {
            data.cell.styles.fillColor = PRIO_FILL[data.cell.raw]
            data.cell.styles.textColor = PRIO_INK[data.cell.raw]
            data.cell.styles.fontStyle = 'bold'
          }
        },
      )
    }
  }

  // ---------- 6. Photos
  d.h1(`6. ${t('rep.6')}`)
  const stills = photos.filter((p) => (p.kind ?? 'photo') === 'photo')
  const clips = photos.filter((p) => (p.kind ?? 'photo') !== 'photo')
  if (!opts.includePhotos || stills.length === 0) {
    d.para(t('rep_no_photos'), { color: GREY })
  } else {
    const byAss = new Map<string, Photo[]>()
    for (const p of stills) byAss.set(p.assessmentId, [...(byAss.get(p.assessmentId) ?? []), p])
    const ordered = sortByPriority(assessments.filter((a) => byAss.has(a.id)))
    const boxW = (CONTENT_W - 6) / 2
    const boxH = 58
    let photoNo = 1
    for (const a of ordered) {
      const list = byAss.get(a.id)!
      d.ensure(boxH + 22)
      d.h2(labelOf(insp, a, t))
      const meta = [a.condition ? t(`cond.${a.condition}`) : null, a.intervention ? t(`int.${a.intervention}`) : null, a.priority].filter(Boolean).join(' · ')
      if (meta) d.para(meta, { size: 8, color: GREY })
      if (a.description) d.para(a.description, { size: 9 })
      for (let i = 0; i < list.length; i += 2) {
        d.ensure(boxH + 12)
        const pair = list.slice(i, i + 2)
        for (let j = 0; j < pair.length; j++) {
          const p = pair[j]
          const x = M + j * (boxW + 6)
          try {
            const dataUrl = await blobToDataUrl(p.blob)
            const [iw, ih] = await imageSize(dataUrl)
            const scale = Math.min(boxW / iw, boxH / ih)
            const w = iw * scale
            const hh = ih * scale
            doc.setFillColor(...LIGHT)
            doc.rect(x, d.y, boxW, boxH, 'F')
            doc.addImage(dataUrl, 'JPEG', x + (boxW - w) / 2, d.y + (boxH - hh) / 2, w, hh, undefined, 'FAST')
          } catch { /* skip broken image */ }
          doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...GREY)
          const cap = `${t('rep_photo_of')} ${photoNo++}${p.caption ? ` — ${p.caption}` : ''}`
          doc.text(doc.splitTextToSize(cap, boxW)[0] as string, x, d.y + boxH + 3.5)
        }
        d.y += boxH + 8
      }
    }
  }

  if (clips.length) {
    d.h2(t('rep_media_refs'))
    const byA = new Map<string, Photo[]>()
    for (const c of clips) byA.set(c.assessmentId, [...(byA.get(c.assessmentId) ?? []), c])
    d.bullets([...byA.entries()].flatMap(([aid, list]) => {
      const a = assessments.find((x) => x.id === aid)
      const where = a ? labelOf(insp, a, t) : '—'
      return list.map((c, i) => `${where}: ${(c.kind === 'video' ? t('video_note') : t('audio_note'))} ${i + 1}${c.duration ? ` (${Math.floor(c.duration / 60)}:${String(c.duration % 60).padStart(2, '0')})` : ''}${c.caption ? ` — ${c.caption}` : ''}`)
    }))
  }

  // ---------- 7–9
  d.h1(`7. ${t('rep.7')}`)
  if (an.required.length) d.table(itemHead, itemRows(an.required), itemCols, prioCell); else d.para(t('no_items'), { color: GREY })
  d.h1(`8. ${t('rep.8')}`)
  if (an.recommended.length) d.table(itemHead, itemRows(an.recommended), itemCols, prioCell); else d.para(t('no_items'), { color: GREY })
  d.h1(`9. ${t('rep.9')}`)
  if (an.optional.length) d.table(itemHead, itemRows(an.optional), itemCols, prioCell); else d.para(t('no_items'), { color: GREY })

  // ---------- 10. Risks
  d.h1(`10. ${t('rep.10')}`)
  if (an.risks.length) d.bullets(an.risks); else d.para(t('no_items'), { color: GREY })

  // ---------- 11. Investment
  d.h1(`11. ${t('rep.11')}`)
  if (!opts.includeBudget) {
    d.para('—', { color: GREY })
  } else {
    const b = computeBudget(insp, assessments)
    d.para(t('budget_intro'), { size: 8, color: GREY })
    if (!b.lines.length) d.para(t('no_budget_lines'), { color: GREY })
    for (const bucket of BUCKETS) {
      const lines = b.lines.filter((l) => l.bucket === bucket)
      if (!lines.length) continue
      d.h2(`${t(`bucket_${bucket}`)} — ${money(b.byBucket[bucket])}`)
      d.table(
        [t('description'), t('quantity'), t('unit'), t('unit_price'), t('line_total')],
        lines.map((l) => [
          `${l.source === 'auto' ? `${zoneLabel(insp, l.zoneId!, t(`cat.${l.categoryId}`))} — ${t(`el.${l.elementId}`)}${l.description ? `: ${l.description}` : ''}` : l.description || '—'}${l.isAssumption ? ' *' : ''}`,
          l.quantity ?? '—', l.unit || '—', l.unitPrice !== null ? money(l.unitPrice) : '—', money(l.total),
        ]),
        { 0: { cellWidth: 'auto' }, 1: { cellWidth: 18, halign: 'right' }, 2: { cellWidth: 14 }, 3: { cellWidth: 26, halign: 'right' }, 4: { cellWidth: 28, halign: 'right' } },
      )
    }
    if (b.lines.length) {
      d.table(
        [t('total_all'), cur],
        [
          [t('subtotal'), money(b.subtotal)],
          [`${t('total_contingency')} (${insp.budget.contingencyPct}%)`, money(b.contingency)],
          ...(insp.budget.taxPct ? [[`${t('total_tax')} (${insp.budget.taxPct}%)`, money(b.tax)] as RowInput] : []),
          [{ content: t('total_all'), styles: { fontStyle: 'bold' } }, { content: money(b.total), styles: { fontStyle: 'bold' } }],
        ],
        { 1: { halign: 'right', cellWidth: 45 } },
      )
      if (b.assumptionCount) d.para(`${t('rep_assumption_mark')} — ${t('assumptions_note', { n: b.assumptionCount })}`, { size: 8, color: GREY })
      d.para(t('excluded_specialist_note'), { size: 8, color: GREY })
    }
  }

  // ---------- 12. Pending verifications
  d.h1(`12. ${t('rep.12')}`)
  const pending = [...new Map([...an.specialist, ...an.notVerified].map((a) => [a.id, a])).values()]
  if (pending.length) {
    d.table(
      [t('rep_table_element'), t('rep_table_condition'), t('rep_table_trade'), t('observations')],
      sortByPriority(pending).map((a) => [labelOf(insp, a, t), a.condition ? t(`cond.${a.condition}`) : '—', a.trade ? t(`trade.${a.trade}`) : t('int.specialist'), [a.description, a.notes].filter(Boolean).join(' · ') || '—']),
      { 0: { cellWidth: 55 }, 1: { cellWidth: 30 }, 2: { cellWidth: 35 }, 3: { cellWidth: 'auto' } },
    )
  } else d.para(t('no_items'), { color: GREY })
  if (an.notAssessed.length) {
    d.h2(`${t('not_assessed_areas')} (${an.notAssessed.length})`)
    const grouped = new Map<string, string[]>()
    for (const s of an.notAssessed) {
      const key = zoneLabel(insp, s.zoneId, t(`cat.${s.categoryId}`))
      grouped.set(key, [...(grouped.get(key) ?? []), t(`el.${s.elementId}`)])
    }
    d.bullets([...grouped.entries()].map(([k, v]) => `${k}: ${v.join(', ')}`))
  }

  // ---------- 13. Conclusion
  d.h1(`13. ${t('rep.13')}`)
  d.box(t(`concl.${an.conclusion.kind}`), conclFill[an.conclusion.kind])
  d.para(t('rep_conclusion_basis'), { bold: true, size: 9 })
  d.bullets(an.conclusion.reasons)
  d.para(t('report_disclaimer'), { size: 8.5, color: GREY })

  // ---------- Header / footer
  const total = doc.getNumberOfPages()
  for (let i = 2; i <= total; i++) {
    doc.setPage(i)
    doc.setDrawColor(...GOLD).setLineWidth(0.5)
    doc.line(M, 12, PAGE_W - M, 12)
    doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...NAVY)
    doc.text(t('app_title'), M, 9.5)
    doc.setFont('helvetica', 'normal').setTextColor(...GREY)
    doc.text(doc.splitTextToSize(`${hotelName} · ${fmtDate(h.inspectionDate, lang)}`, 110)[0] as string, PAGE_W - M, 9.5, { align: 'right' })
    doc.setFontSize(7.5).setTextColor(...GREY)
    doc.text(`${t('company')} · ${t('rep_generated', { date: fmtDate(Date.now(), lang) })}`, M, PAGE_H - 8)
    doc.text(t('rep_page', { n: i, t: total }), PAGE_W - M, PAGE_H - 8, { align: 'right' })
  }

  const safe = hotelName.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 40) || 'hotel'
  doc.save(`${t('pdf_file_prefix')}-${safe}-${h.inspectionDate || 'draft'}.pdf`)
}
