import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { detectLocale, persistLocale } from './detect'
import { DEFAULT_LOCALE, type Locale, type Translations } from './types'

type Interpolations = Record<string, string | number>

type I18nContextValue = {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (path: string, vars?: Interpolations) => string
  translations: Translations
}

const I18nContext = createContext<I18nContextValue | null>(null)

const interpolate = (template: string, vars?: Interpolations) => {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  )
}

const getByPath = (obj: unknown, path: string): unknown => {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return current
}

const fetchTranslations = async (locale: Locale): Promise<Translations> => {
  const url = `${import.meta.env.BASE_URL}locales/${locale}.json`
  const res = await fetch(url, { cache: 'force-cache' })
  if (!res.ok) throw new Error(`Failed to load locale "${locale}": ${res.status}`)
  return (await res.json()) as Translations
}

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

export const I18nProvider = ({ children, fallback = null }: Props) => {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)
  const [translations, setTranslations] = useState<Translations | null>(null)
  const cacheRef = useRef<Map<Locale, Translations>>(new Map())

  useEffect(() => {
    let cancelled = false
    const cached = cacheRef.current.get(locale)
    if (cached) {
      setTranslations(cached)
      document.documentElement.lang = locale
      return
    }

    const load = async () => {
      try {
        const data = await fetchTranslations(locale)
        if (cancelled) return
        cacheRef.current.set(locale, data)
        setTranslations(data)
        document.documentElement.lang = locale
      } catch (err) {
        console.error('[i18n] load error', err)
        if (cancelled || locale === DEFAULT_LOCALE) return
        setLocaleState(DEFAULT_LOCALE)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next)
    setLocaleState(next)
  }, [])

  const t = useCallback(
    (path: string, vars?: Interpolations) => {
      if (!translations) return ''
      const value = getByPath(translations, path)
      if (typeof value !== 'string') {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] missing key "${path}" for locale "${locale}"`)
        }
        return path
      }
      return interpolate(value, vars)
    },
    [translations, locale],
  )

  const value = useMemo<I18nContextValue | null>(() => {
    if (!translations) return null
    return { locale, setLocale, t, translations }
  }, [locale, setLocale, t, translations])

  if (!value) return <>{fallback}</>
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
