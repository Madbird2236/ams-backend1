import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang } from '../types'
import { en, type Dict } from './en'
import { pt } from './pt'
import { de } from './de'
import { it } from './it'

export const DICTS: Record<Lang, Dict> = { en, pt, de, it }
export const LANGS: Lang[] = ['pt', 'de', 'it', 'en']
export const LANG_NAMES: Record<Lang, string> = { pt: 'Português', de: 'Deutsch', it: 'Italiano', en: 'English' }

export type TKey = keyof Dict
export type TFn = (key: TKey | string, vars?: Record<string, string | number>) => string

export function makeT(lang: Lang): TFn {
  const d = DICTS[lang] ?? en
  return (key, vars) => {
    let s: string = (d as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
    return s
  }
}

interface I18nCtx { lang: Lang; setLang: (l: Lang) => void; t: TFn }
const Ctx = createContext<I18nCtx>({ lang: 'pt', setLang: () => {}, t: makeT('pt') })

const LS_KEY = 'ams-hi-lang'
function detect(): Lang {
  try {
    const saved = localStorage.getItem(LS_KEY) as Lang | null
    if (saved && LANGS.includes(saved)) return saved
  } catch { /* ignore */ }
  const nav = (navigator.language || 'pt').slice(0, 2) as Lang
  return LANGS.includes(nav) ? nav : 'pt'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect)
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(LS_KEY, l) } catch { /* ignore */ }
  }, [])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const value = useMemo(() => ({ lang, setLang, t: makeT(lang) }), [lang, setLang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useT = () => useContext(Ctx)
