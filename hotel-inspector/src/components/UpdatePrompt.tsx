import { useRegisterSW } from 'virtual:pwa-register/react'
import { useT } from '../i18n'

export function UpdatePrompt() {
  const { t } = useT()
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({ immediate: !import.meta.env.VITE_NO_PWA })
  if (!needRefresh) return null
  return (
    <div role="status" className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3 shadow-[0_8px_24px_rgba(20,20,20,0.12)]">
      <p className="text-[14px]">{t('update_available')}</p>
      <button type="button" className="btn-primary min-h-10 shrink-0 px-3 text-[14px]" onClick={() => updateServiceWorker(true)}>{t('reload')}</button>
    </div>
  )
}
