import Dexie, { type EntityTable } from 'dexie'
import type { Assessment, Inspection, Photo } from '../types'

class AmsDb extends Dexie {
  inspections!: EntityTable<Inspection, 'id'>
  assessments!: EntityTable<Assessment, 'id'>
  photos!: EntityTable<Photo, 'id'>

  constructor() {
    super('ams-hotel-inspector')
    this.version(1).stores({
      inspections: 'id, updatedAt, createdAt',
      assessments: 'id, inspectionId, [inspectionId+zoneId], [inspectionId+zoneId+elementId], zoneId',
      photos: 'id, inspectionId, assessmentId',
    })
  }
}

export const db = new AmsDb()

/** Ask the browser to protect the IndexedDB from eviction (best effort). */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true
    if (navigator.storage?.persist) return await navigator.storage.persist()
  } catch { /* ignore */ }
  return false
}
