export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export const todayIso = (): string => new Date().toISOString().slice(0, 10)

export function fmtDate(iso: string | number | undefined, lang: string): string {
  if (!iso) return '—'
  const d = typeof iso === 'number' ? new Date(iso) : new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  if (Number.isNaN(d.getTime())) return String(iso)
  const locale = { pt: 'pt-PT', de: 'de-CH', it: 'it-IT', en: 'en-GB' }[lang] ?? 'en-GB'
  return d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function fmtMoney(n: number, currency: string, lang: string): string {
  const locale = { pt: 'pt-PT', de: 'de-CH', it: 'it-IT', en: 'en-GB' }[lang] ?? 'en-GB'
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  } catch {
    return `${n.toFixed(0)} ${currency}`
  }
}

export const parseNum = (s: string | number | null | undefined): number | null => {
  if (s === null || s === undefined) return null
  if (typeof s === 'number') return Number.isFinite(s) ? s : null
  const cleaned = s.replace(/[^\d.,-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : null
}
