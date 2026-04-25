import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './types'

const STORAGE_KEY = 'simon-dice:locale'

const isSupported = (value: string): value is Locale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(value)

export const detectLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && isSupported(saved)) return saved
  } catch {
    // localStorage no disponible (modo privado / SSR)
  }

  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]

  for (const tag of candidates) {
    const base = tag.toLowerCase().split('-')[0]
    if (isSupported(base)) return base
  }

  return DEFAULT_LOCALE
}

export const persistLocale = (locale: Locale) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // ignore
  }
}
