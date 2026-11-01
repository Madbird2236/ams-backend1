import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'

export function TopBar({ title, subtitle, back, right }: { title: string; subtitle?: string; back?: string | (() => void); right?: ReactNode }) {
  const nav = useNavigate()
  const { t } = useT()
  const goBack = () => (typeof back === 'function' ? back() : back ? nav(back) : nav(-1))
  return (
    <header className="sticky top-0 z-20 bg-brand-900 text-white shadow-md safe-top">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-3">
        {back !== undefined && (
          <button type="button" onClick={goBack} aria-label={t('back')} className="-ml-1 flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-slate-300">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}

export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`mx-auto w-full max-w-3xl flex-1 px-3 py-4 safe-bottom ${className}`}>{children}</main>
}

export function Brand({ light = false }: { light?: boolean }) {
  const { t } = useT()
  return (
    <div className="flex items-center gap-3">
      <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden><rect width="64" height="64" rx="12" fill="#0f172a" /><path d="M14 46 L32 14 L50 46 Z" fill="none" stroke="#c7a76b" strokeWidth="4" strokeLinejoin="round" /><path d="M22 46 L32 30 L42 46" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinejoin="round" /><rect x="28" y="38" width="8" height="8" fill="#c7a76b" /></svg>
      <div>
        <div className={`text-sm font-extrabold tracking-[0.18em] ${light ? 'text-white' : 'text-brand-900'}`}>{t('app_title')}</div>
        <div className={`text-[11px] ${light ? 'text-slate-300' : 'text-slate-500'}`}>{t('app_subtitle')}</div>
      </div>
    </div>
  )
}
