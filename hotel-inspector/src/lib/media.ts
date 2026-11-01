import type { MediaKind } from '../types'

export const kindOf = (mime: string): MediaKind => (mime.startsWith('video/') ? 'video' : mime.startsWith('audio/') ? 'audio' : 'photo')

/** Duration in seconds of an audio/video blob (best effort; 0 when unknown). */
export function probeDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const el = document.createElement(blob.type.startsWith('video/') ? 'video' : 'audio')
    const done = (d: number) => { URL.revokeObjectURL(url); resolve(Number.isFinite(d) && d > 0 ? Math.round(d) : 0) }
    el.preload = 'metadata'
    el.onloadedmetadata = () => {
      if (el.duration === Infinity) {
        // MediaRecorder blobs often report Infinity until seeked to the end
        el.currentTime = 1e9
        el.ontimeupdate = () => { el.ontimeupdate = null; done(el.duration) }
      } else done(el.duration)
    }
    el.onerror = () => done(0)
    setTimeout(() => done(0), 4000)
    el.src = url
  })
}

export const fmtDuration = (s: number | undefined): string => {
  if (!s) return ''
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export const isSecure = (): boolean => typeof window !== 'undefined' && (window.isSecureContext || location.hostname === 'localhost')

export const canRecord = (): boolean => isSecure() && typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

type SR = { new (): SpeechRecognitionLike }
interface SpeechRecognitionLike {
  lang: string; continuous: boolean; interimResults: boolean
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null; onerror: ((e: unknown) => void) | null
  start(): void; stop(): void
}
export function speechRecognitionCtor(): SR | null {
  const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR }
  return isSecure() ? (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) : null
}
export const speechLocale: Record<string, string> = { pt: 'pt-PT', de: 'de-CH', it: 'it-IT', en: 'en-GB' }
