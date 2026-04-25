export const Locale = {
  EN: 'en',
  FR: 'fr',
  JA: 'ja',
  ES: 'es',
  IT: 'it',
  ZH: 'zh',
} as const

export type Locale = (typeof Locale)[keyof typeof Locale]

export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'fr', 'ja', 'es', 'it', 'zh']

export const DEFAULT_LOCALE: Locale = 'en'

export const SPEECH_TAGS: Record<Locale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ja: 'ja-JP',
  es: 'es-ES',
  it: 'it-IT',
  zh: 'zh-CN',
}

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ja: '日本語',
  es: 'Español',
  it: 'Italiano',
  zh: '中文',
}

export type Translations = {
  ui: {
    title: string
    titleAccent: string
    subtitle: string
    playersLabel: string
    startButton: string
    voiceWarning: string
    languageLabel: string
    playerSingular: string
    playerPlural: string
    of: string
    phasePreparing: string
    phaseAnnouncing: string
    phaseAsking: string
    phaseListening: string
    endButton: string
    endButtonAria: string
    helpVoice: string
    helpManual: string
    winnerTitle: string
    noWinnerTitle: string
    winnerSubtitle: string
    noWinnerSubtitle: string
    playAgain: string
  }
  speech: {
    simonSays: string
    gameStartSingle: string
    gameStartPlural: string
    askRemaining: string
    notUnderstood: string
    winnerEnding: string
    noWinnerEnding: string
  }
  actions: string[]
  numberWords: Record<string, number>
}
