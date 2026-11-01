import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './index'
import type { Assessment, Inspection, Photo } from '../types'

export function useInspections(): Inspection[] | undefined {
  return useLiveQuery(() => db.inspections.orderBy('updatedAt').reverse().toArray(), [])
}

export function useInspection(id: string | undefined): Inspection | undefined | null {
  return useLiveQuery(async () => (id ? (await db.inspections.get(id)) ?? null : null), [id])
}

export function useAssessments(inspectionId: string | undefined): Assessment[] | undefined {
  return useLiveQuery(() => (inspectionId ? db.assessments.where('inspectionId').equals(inspectionId).toArray() : Promise.resolve([] as Assessment[])), [inspectionId])
}

export function useAssessment(inspectionId: string | undefined, zoneId: string | undefined, elementId: string | undefined): Assessment | undefined | null {
  return useLiveQuery(
    async () => (inspectionId && zoneId && elementId ? (await db.assessments.where('[inspectionId+zoneId+elementId]').equals([inspectionId, zoneId, elementId]).first()) ?? null : null),
    [inspectionId, zoneId, elementId],
  )
}

export function usePhotos(assessmentId: string | undefined): Photo[] | undefined {
  return useLiveQuery(() => (assessmentId ? db.photos.where('assessmentId').equals(assessmentId).toArray() : Promise.resolve([] as Photo[])), [assessmentId])
}

export function useInspectionPhotos(inspectionId: string | undefined): Photo[] | undefined {
  return useLiveQuery(() => (inspectionId ? db.photos.where('inspectionId').equals(inspectionId).toArray() : Promise.resolve([] as Photo[])), [inspectionId])
}

export async function patchInspection(id: string, patch: Partial<Inspection> | ((i: Inspection) => Partial<Inspection>)) {
  await db.transaction('rw', db.inspections, async () => {
    const cur = await db.inspections.get(id)
    if (!cur) return
    const p = typeof patch === 'function' ? patch(cur) : patch
    await db.inspections.put({ ...cur, ...p, updatedAt: Date.now() })
  })
}

export async function touchInspection(id: string) {
  await db.inspections.update(id, { updatedAt: Date.now() })
}
