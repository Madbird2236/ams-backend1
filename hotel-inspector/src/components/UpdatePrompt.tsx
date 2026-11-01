import { useRegisterSW } from 'virtual:pwa-register/react'
import { useT } from '../i18n'

export function UpdatePrompt() {
  const { t } = useT()
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  if (!needRefresh) return null
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-xl border border-gold-500 bg-white p-3 shadow-lg">
      <p className="text-sm">{t('update_available')}</p>
      <button type="button" className="btn-primary mt-2 w-full py-2 text-sm" onClick={() => updateServiceWorker(true)}>{t('reload')}</button>
    </div>
  )
}
