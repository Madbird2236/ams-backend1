import type { ReactNode } from 'react'
import type { Condition, Intervention, Lang, Priority } from '../types'
import { useT, LANGS, LANG_NAMES } from '../i18n'

export function Field({ label, hint, children, right }: { label: string; hint?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        <span className="label">{label}{hint && <span className="text-faint"> · {hint}</span>}</span>
        {right}
      </div>
      {children}
    </div>
  )
}

/** Semantic tone per value, used by choice groups and pills. */
export type Tone = 'positive' | 'neutral' | 'warning' | 'negative' | 'info' | 'alarm'

export const conditionTone: Record<Condition, Tone> = {
  good: 'positive', light_wear: 'neutral', needs_repair: 'warning', needs_replacement: 'negative', not_verified: 'neutral',
}
export const priorityTone: Record<Priority, Tone> = { P0: 'alarm', P1: 'negative', P2: 'warning', P3: 'info' }
export const interventionTone: Record<Intervention, Tone> = {
  required: 'negative', recommended: 'warning', optional: 'info', none: 'positive', specialist: 'neutral',
}

const pillTone: Record<Tone, string> = {
  positive: 'bg-positive-bg text-positive-ink',
  neutral: 'bg-active text-ink',
  warning: 'bg-warning-bg text-warning border border-warning-border',
  negative: 'bg-negative-bg text-negative-ink',
  info: 'bg-info-bg text-info-ink',
  alarm: 'bg-negative text-white',
}

export function Pill({ tone = 'neutral', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={`pill ${pillTone[tone]} ${className}`}>{children}</span>
}

export function ChoiceGroup<T extends string>({
  options, value, onChange, render, columns = 2, toneFor,
}: {
  options: T[]; value: T | null; onChange: (v: T | null) => void; render: (v: T) => string; columns?: 1 | 2 | 3; toneFor?: (v: T) => Tone
}) {
  const cols = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' }[columns]
  return (
    <div className={`grid gap-2 ${cols}`} role="group">
      {options.map((o) => {
        const on = value === o
        const tone = toneFor?.(o) ?? 'neutral'
        return (
          <button type="button" key={o} onClick={() => onChange(on ? null : o)} aria-pressed={on} className={`choice choice-${tone === 'alarm' ? 'alarm' : tone}`}>
            {render(o)}
          </button>
        )
      })}
    </div>
  )
}

export function PriorityPill({ p }: { p: Priority | null }) {
  if (!p) return null
  return <Pill tone={priorityTone[p]}>{p}</Pill>
}

export function ConditionPill({ c }: { c: Condition | null }) {
  const { t } = useT()
  if (!c) return <span className="text-[13px] text-faint">{t('not_assessed')}</span>
  return <Pill tone={conditionTone[c]}>{t(`cond.${c}`)}</Pill>
}

export function Track({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const p = max === 0 ? 0 : Math.round((value / max) * 100)
  return <div className={`track ${className}`} role="progressbar" aria-valuenow={value} aria-valuemax={max}><i style={{ width: `${p}%` }} /></div>
}

export function LangSwitcher() {
  const { lang, setLang } = useT()
  return (
    <div className="inline-flex rounded-[var(--radius-control)] border border-control bg-surface p-0.5" role="group" aria-label="Language">
      {LANGS.map((l: Lang) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} title={LANG_NAMES[l]}
          className={`press rounded-[4px] px-2.5 min-h-9 text-[12px] font-semibold uppercase ${lang === l ? 'bg-ink text-white' : 'text-muted'}`}>
          {l}
        </button>
      ))}
    </div>
  )
}

/** A titled block. Title is sentence case 16/600; content sits on a bordered panel. */
export function Section({ title, children, right, flush = false }: { title: string; children: ReactNode; right?: ReactNode; flush?: boolean }) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3 px-0.5">
        <h2 className="text-[16px] font-semibold leading-6">{title}</h2>
        {right && <div className="text-[13px] text-muted num">{right}</div>}
      </div>
      <div className={`panel ${flush ? 'overflow-hidden' : 'p-4'}`}>{children}</div>
    </section>
  )
}

/** KPI strip: one container split by hairlines, label over value, value 24/400 in ink. Colour only when the number is bad. */
export function KpiStrip({ items }: { items: Array<{ label: string; value: ReactNode; bad?: boolean }> }) {
  const cols = items.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : items.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
  return (
    <div className={`panel grid ${cols} overflow-hidden`}>
      {items.map((it, i) => (
        <div key={i} className={`px-4 py-3 ${i > 0 ? 'border-l border-rule' : ''} ${items.length === 4 && i >= 2 ? 'border-t border-rule sm:border-t-0' : ''} ${items.length === 4 && i === 2 ? 'border-l-0 sm:border-l' : ''}`}>
          <div className="text-[13px] leading-4 text-muted">{it.label}</div>
          <div className={`num mt-1 text-[24px] leading-7 font-normal ${it.bad ? 'text-negative' : 'text-ink'}`}>{it.value}</div>
        </div>
      ))}
    </div>
  )
}

export function Empty({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-control px-4 py-5 text-center text-[14px] text-muted">
      <p>{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export function Chevron() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-faint shrink-0" aria-hidden><path d="M6 3l5 5-5 5" /></svg>
}
