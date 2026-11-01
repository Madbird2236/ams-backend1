import type { ReactNode } from 'react'
import type { Condition, Intervention, Priority } from '../types'
import { useT, LANGS, LANG_NAMES } from '../i18n'
import type { Lang } from '../types'

export function Field({ label, hint, children, right }: { label: string; hint?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="label">{label}{hint && <span className="ml-1 font-normal normal-case text-slate-400">({hint})</span>}</span>
        {right}
      </div>
      {children}
    </div>
  )
}

export function ChoiceGroup<T extends string>({
  options, value, onChange, render, columns = 2, colorFor,
}: {
  options: T[]; value: T | null; onChange: (v: T | null) => void; render: (v: T) => string; columns?: number; colorFor?: (v: T) => string
}) {
  return (
    <div className={`grid gap-2 ${columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((o) => {
        const on = value === o
        const color = colorFor?.(o)
        return (
          <button
            type="button"
            key={o}
            onClick={() => onChange(on ? null : o)}
            className={`choice ${on ? (color ?? 'choice-on') : 'choice-off'}`}
            aria-pressed={on}
          >
            {render(o)}
          </button>
        )
      })}
    </div>
  )
}

export const conditionColor: Record<Condition, string> = {
  good: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  light_wear: 'bg-lime-100 text-lime-800 border-lime-200',
  needs_repair: 'bg-amber-100 text-amber-800 border-amber-200',
  needs_replacement: 'bg-red-100 text-red-800 border-red-200',
  not_verified: 'bg-slate-200 text-slate-700 border-slate-300',
}
export const conditionOn: Record<Condition, string> = {
  good: 'border-emerald-600 bg-emerald-600 text-white',
  light_wear: 'border-lime-600 bg-lime-600 text-white',
  needs_repair: 'border-amber-500 bg-amber-500 text-white',
  needs_replacement: 'border-red-600 bg-red-600 text-white',
  not_verified: 'border-slate-500 bg-slate-500 text-white',
}
export const priorityColor: Record<Priority, string> = {
  P0: 'bg-red-600 text-white',
  P1: 'bg-orange-500 text-white',
  P2: 'bg-amber-400 text-slate-900',
  P3: 'bg-sky-200 text-sky-900',
}
export const priorityOn: Record<Priority, string> = {
  P0: 'border-red-600 bg-red-600 text-white',
  P1: 'border-orange-500 bg-orange-500 text-white',
  P2: 'border-amber-400 bg-amber-400 text-slate-900',
  P3: 'border-sky-500 bg-sky-500 text-white',
}
export const interventionColor: Record<Intervention, string> = {
  required: 'bg-red-50 text-red-700 border border-red-200',
  recommended: 'bg-amber-50 text-amber-800 border border-amber-200',
  optional: 'bg-sky-50 text-sky-800 border border-sky-200',
  none: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  specialist: 'bg-violet-50 text-violet-800 border border-violet-200',
}

export function PriorityBadge({ p }: { p: Priority | null }) {
  if (!p) return null
  return <span className={`chip ${priorityColor[p]}`}>{p}</span>
}

export function ConditionChip({ c }: { c: Condition | null }) {
  const { t } = useT()
  if (!c) return <span className="chip bg-slate-100 text-slate-500">{t('not_assessed')}</span>
  return <span className={`chip border ${conditionColor[c]}`}>{t(`cond.${c}`)}</span>
}

export function ProgressBar({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const p = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${p}%` }} />
    </div>
  )
}

export function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useT()
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {LANGS.map((l: Lang) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase transition ${lang === l ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          title={LANG_NAMES[l]}
        >
          {compact ? l : l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}

export function Stat({ label, value, tone = 'default' }: { label: string; value: ReactNode; tone?: 'default' | 'danger' | 'warn' | 'ok' | 'muted' }) {
  const tones = {
    default: 'bg-white border-slate-200 text-slate-900',
    danger: 'bg-red-50 border-red-200 text-red-800',
    warn: 'bg-amber-50 border-amber-200 text-amber-900',
    ok: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    muted: 'bg-slate-50 border-slate-200 text-slate-600',
  }
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <div className="text-2xl font-extrabold leading-none">{value}</div>
      <div className="mt-1 text-xs font-medium opacity-80">{label}</div>
    </div>
  )
}

export function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">{text}</p>
}
