import { db } from '../db'
import type { Assessment, ExportBundle, Inspection, Photo } from '../types'
import { blobToDataUrl, dataUrlToBlob } from './photos'

export async function buildBundle(inspectionIds?: string[]): Promise<ExportBundle> {
  const inspections = inspectionIds
    ? (await db.inspections.bulkGet(inspectionIds)).filter(Boolean) as Inspection[]
    : await db.inspections.toArray()
  const ids = inspections.map((i) => i.id)
  const assessments = await db.assessments.where('inspectionId').anyOf(ids).toArray()
  const photosRaw = await db.photos.where('inspectionId').anyOf(ids).toArray()
  const photos = await Promise.all(
    photosRaw.map(async (p) => {
      const { blob, ...rest } = p
      return { ...rest, dataUrl: await blobToDataUrl(blob) }
    }),
  )
  return { app: 'ams-hotel-inspector', version: 1, exportedAt: Date.now(), inspections, assessments, photos }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function exportJson(inspectionIds: string[] | undefined, filename: string) {
  const bundle = await buildBundle(inspectionIds)
  downloadBlob(new Blob([JSON.stringify(bundle)], { type: 'application/json' }), `${filename}.json`)
}

export function isBundle(x: unknown): x is ExportBundle {
  if (!x || typeof x !== 'object') return false
  const b = x as Partial<ExportBundle>
  return b.app === 'ams-hotel-inspector' && Array.isArray(b.inspections) && Array.isArray(b.assessments) && Array.isArray(b.photos)
}

/** Imports a bundle; inspections with the same id are replaced. Returns number of inspections imported. */
export async function importBundle(bundle: ExportBundle): Promise<number> {
  const photos: Photo[] = []
  for (const p of bundle.photos) {
    const { dataUrl, ...rest } = p
    photos.push({ ...rest, blob: await dataUrlToBlob(dataUrl) })
  }
  await db.transaction('rw', db.inspections, db.assessments, db.photos, async () => {
    const ids = bundle.inspections.map((i) => i.id)
    await db.assessments.where('inspectionId').anyOf(ids).delete()
    await db.photos.where('inspectionId').anyOf(ids).delete()
    await db.inspections.bulkPut(bundle.inspections)
    await db.assessments.bulkPut(bundle.assessments as Assessment[])
    await db.photos.bulkPut(photos)
  })
  return bundle.inspections.length
}

export async function deleteInspection(id: string) {
  await db.transaction('rw', db.inspections, db.assessments, db.photos, async () => {
    await db.assessments.where('inspectionId').equals(id).delete()
    await db.photos.where('inspectionId').equals(id).delete()
    await db.inspections.delete(id)
  })
}

export async function duplicateInspection(id: string, newId: string): Promise<void> {
  const insp = await db.inspections.get(id)
  if (!insp) return
  const assessments = await db.assessments.where('inspectionId').equals(id).toArray()
  const photos = await db.photos.where('inspectionId').equals(id).toArray()
  const now = Date.now()
  const idMap = new Map<string, string>()
  const newAss = assessments.map((a) => {
    const nid = `${newId}-${a.id.slice(0, 8)}-${Math.random().toString(36).slice(2, 6)}`
    idMap.set(a.id, nid)
    return { ...a, id: nid, inspectionId: newId }
  })
  const newPhotos = photos.map((p) => ({ ...p, id: `${newId}-${p.id.slice(0, 8)}-${Math.random().toString(36).slice(2, 6)}`, inspectionId: newId, assessmentId: idMap.get(p.assessmentId) ?? p.assessmentId }))
  await db.transaction('rw', db.inspections, db.assessments, db.photos, async () => {
    await db.inspections.put({ ...insp, id: newId, createdAt: now, updatedAt: now, status: 'draft', hotel: { ...insp.hotel, name: `${insp.hotel.name} (copy)` } })
    await db.assessments.bulkPut(newAss)
    await db.photos.bulkPut(newPhotos)
  })
}
