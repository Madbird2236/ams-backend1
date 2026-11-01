import { useEffect, useRef, useState } from 'react'
import { Microphone, Stop, VideoCamera, Trash, Camera, Images } from '@phosphor-icons/react'
import type { Photo } from '../types'
import { useT } from '../i18n'
import { canRecord, fmtDuration, isSecure } from '../lib/media'

/** Four capture controls: photo (camera), gallery, video (camera), audio (in-app recorder or system recorder). */
export function CaptureBar({ busy, onFiles, onAudioBlob }: { busy: boolean; onFiles: (files: FileList | null) => void; onAudioBlob: (blob: Blob, seconds: number) => void }) {
  const { t } = useT()
  const camRef = useRef<HTMLInputElement>(null)
  const galRef = useRef<HTMLInputElement>(null)
  const vidRef = useRef<HTMLInputElement>(null)
  const audRef = useRef<HTMLInputElement>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const startedAt = useRef(0)
  const [rec, setRec] = useState(false)
  const [secs, setSecs] = useState(0)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!rec) return
    const h = setInterval(() => setSecs(Math.round((Date.now() - startedAt.current) / 1000)), 500)
    return () => clearInterval(h)
  }, [rec])

  const startAudio = async () => {
    setErr(null)
    if (!canRecord()) { audRef.current?.click(); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported(m))
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunks.current = []
      mr.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop())
        const blob = new Blob(chunks.current, { type: mr.mimeType || mime || 'audio/webm' })
        const seconds = Math.round((Date.now() - startedAt.current) / 1000)
        setRec(false); setSecs(0)
        if (blob.size > 0) onAudioBlob(blob, seconds)
      }
      recRef.current = mr
      startedAt.current = Date.now()
      mr.start(1000)
      setRec(true)
    } catch {
      setErr(t('mic_denied'))
    }
  }
  const stopAudio = () => recRef.current?.state !== 'inactive' && recRef.current?.stop()

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={busy || rec} onClick={() => camRef.current?.click()} className="btn-primary min-h-12"><Camera size={20} aria-hidden /> {t('take_photo')}</button>
        <button type="button" disabled={busy || rec} onClick={() => galRef.current?.click()} className="btn-secondary min-h-12"><Images size={20} aria-hidden /> {t('add_photo')}</button>
        <button type="button" disabled={busy || rec} onClick={() => vidRef.current?.click()} className="btn-secondary min-h-12"><VideoCamera size={20} aria-hidden /> {t('take_video')}</button>
        {rec ? (
          <button type="button" onClick={stopAudio} className="btn min-h-12 bg-negative text-white" aria-live="polite">
            <Stop size={20} weight="fill" aria-hidden /> {t('stop_recording')} <span className="num">{fmtDuration(secs)}</span>
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={startAudio} className="btn-secondary min-h-12"><Microphone size={20} aria-hidden /> {t('record_audio')}</button>
        )}
      </div>
      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFiles(e.target.files)} />
      <input ref={galRef} type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      <input ref={vidRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={(e) => onFiles(e.target.files)} />
      <input ref={audRef} type="file" accept="audio/*" capture className="hidden" onChange={(e) => onFiles(e.target.files)} />
      {err && <p className="mt-2 text-[13px] text-negative" role="alert">{err}</p>}
      {!isSecure() && <p className="mt-2 text-[12px] leading-4 text-warning">{t('secure_context_hint')}</p>}
    </div>
  )
}

export function MediaItem({ p, onDelete, onCaption }: { p: Photo; onDelete: () => void; onCaption: (c: string) => void }) {
  const { t } = useT()
  const [url, setUrl] = useState('')
  useEffect(() => {
    const u = URL.createObjectURL(p.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [p.blob])
  const kind = p.kind ?? 'photo'
  return (
    <figure className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-raised">
      {kind === 'photo' && <img src={url} alt={p.caption || ''} className="aspect-[4/3] w-full object-cover" />}
      {kind === 'video' && <video src={url} controls playsInline preload="metadata" className="aspect-video w-full bg-ink" />}
      {kind === 'audio' && (
        <div className="flex items-center gap-3 px-3 pt-3">
          <Microphone size={18} className="shrink-0 text-muted" aria-hidden />
          <audio src={url} controls preload="metadata" className="h-10 w-full" />
        </div>
      )}
      <figcaption className="flex items-center gap-2 p-2">
        <span className="num shrink-0 text-[12px] text-muted">{kind === 'photo' ? '' : fmtDuration(p.duration)}</span>
        <input className="input min-h-10 text-[14px]" placeholder={t('photo_caption')} defaultValue={p.caption} onBlur={(e) => onCaption(e.target.value)} aria-label={t('photo_caption')} />
        <button type="button" onClick={onDelete} className="btn-ghost min-h-10 w-10 shrink-0 px-0 text-negative-ink" aria-label={t('delete_photo')}><Trash size={18} aria-hidden /></button>
      </figcaption>
    </figure>
  )
}
