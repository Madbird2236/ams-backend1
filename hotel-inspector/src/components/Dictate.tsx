import { useEffect, useRef, useState } from 'react'
import { Microphone, Stop } from '@phosphor-icons/react'
import { useT } from '../i18n'
import { speechRecognitionCtor, speechLocale } from '../lib/media'

/** Voice dictation into a text field. Appends final transcripts via onText. Renders nothing when unsupported. */
export function Dictate({ onText }: { onText: (text: string) => void }) {
  const { t, lang } = useT()
  const Ctor = speechRecognitionCtor()
  const recRef = useRef<InstanceType<NonNullable<typeof Ctor>> | null>(null)
  const [on, setOn] = useState(false)
  const onTextRef = useRef(onText)
  onTextRef.current = onText

  useEffect(() => () => recRef.current?.stop(), [])
  if (!Ctor) return null

  const toggle = () => {
    if (on) { recRef.current?.stop(); return }
    const r = new Ctor()
    r.lang = speechLocale[lang] ?? 'en-GB'
    r.continuous = true
    r.interimResults = false
    r.onresult = (e) => {
      let text = ''
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript + ' '
      if (text.trim()) onTextRef.current(text.trim())
    }
    r.onend = () => setOn(false)
    r.onerror = () => setOn(false)
    recRef.current = r
    r.start()
    setOn(true)
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={on} title={t('dictate')}
      className={`press mb-1.5 inline-flex min-h-7 items-center gap-1 rounded-[var(--radius-chip)] px-2 text-[12px] font-medium ${on ? 'bg-negative text-white' : 'bg-active text-ink'}`}>
      {on ? <Stop size={14} weight="fill" aria-hidden /> : <Microphone size={14} aria-hidden />} {on ? t('listening') : t('dictate')}
    </button>
  )
}
