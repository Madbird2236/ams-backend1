import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeft } from '@phosphor-icons/react'
import { useT } from '../i18n'

/** Mark: the AMS monogram, drawn for this product (a gable over a core). */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="shrink-0">
      <rect width="64" height="64" rx="12" fill="#15202f" />
      <path d="M14 46 L32 14 L50 46 Z" fill="none" stroke="#c7a76b" strokeWidth="4" strokeLinejoin="round" />
      <path d="M22 46 L32 30 L42 46" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinejoin="round" />
      <rect x="28" y="38" width="8" height="8" fill="#c7a76b" />
    </svg>
  )
}

/** The phone top bar: on the ground, separated by a 1px rule. Title 17/600; the back control is a 44px target. */
export function TopBar({ title, subtitle, back, right }: { title: string; subtitle?: string; back?: string | (() => void); right?: ReactNode }) {
  const nav = useNavigate()
  const { t } = useT()
  const goBack = () => (typeof back === 'function' ? back() : back ? nav(back) : nav(-1))
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-ground/95 backdrop-blur-sm safe-top">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-1 px-2">
        {back !== undefined ? (
          <button type="button" onClick={goBack} aria-label={t('back')} className="press flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] text-ink">
            <CaretLeft size={22} weight="regular" />
          </button>
        ) : (
          <div className="pl-2"><Mark /></div>
        )}
        <div className="min-w-0 flex-1 px-1">
          <h1 className="truncate text-[17px] font-semibold leading-5">{title}</h1>
          {subtitle && <p className="truncate text-[12px] leading-4 text-muted num">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}

export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`mx-auto w-full max-w-3xl flex-1 px-4 py-4 safe-bottom ${className}`}>{children}</main>
}

export function Brand() {
  const { t } = useT()
  return (
    <div className="flex items-center gap-3">
      <Mark size={36} />
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-[0.04em]">{t('app_title')}</div>
        <div className="text-[12px] text-muted">{t('company')}</div>
      </div>
    </div>
  )
}
