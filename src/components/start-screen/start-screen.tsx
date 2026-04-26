import { useState, type FormEvent } from 'react'
import { isSpeechRecognitionSupported } from '../../audio/use-listen'
import {
  interpolateJsx,
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  useI18n,
  type Locale,
} from '../../i18n'
import styles from './start-screen.module.css'

type Props = {
  onStart: (players: number) => void
}

const PLAYERS_STORAGE_KEY = 'simon-dice:players'
const DEFAULT_PLAYERS = '4'

const readSavedPlayers = (): string => {
  if (typeof window === 'undefined') return DEFAULT_PLAYERS
  try {
    const saved = window.localStorage.getItem(PLAYERS_STORAGE_KEY)
    if (!saved) return DEFAULT_PLAYERS
    const parsed = Number(saved)
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 30) return saved
  } catch {
    // localStorage unavailable (private mode / SSR)
  }
  return DEFAULT_PLAYERS
}

const persistPlayers = (players: number) => {
  try {
    window.localStorage.setItem(PLAYERS_STORAGE_KEY, String(players))
  } catch {
    // ignore
  }
}

export const StartScreen = ({ onStart }: Props) => {
  const { t, translations, locale, setLocale } = useI18n()
  const [value, setValue] = useState(readSavedPlayers)
  const trimmed = value.trim()
  const parsed = Number(trimmed)
  const isValid = trimmed !== '' && Number.isInteger(parsed) && parsed >= 1 && parsed <= 30

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) return
    persistPlayers(parsed)
    onStart(parsed)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.languageRow}>
          <label className={styles.languageLabel} htmlFor="language">
            {t('ui.languageLabel')}
          </label>
          <select
            id="language"
            className={styles.languageSelect}
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
          >
            {SUPPORTED_LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_NAMES[l]}
              </option>
            ))}
          </select>
        </div>

        <h1 className={styles.title}>
          <span className={styles.titleAccent}>{translations.ui.titleAccent}</span>{' '}
          {t('ui.title')}
        </h1>
        <p className={styles.subtitle}>
          {interpolateJsx(translations.ui.subtitle, {
            strong: <strong>{translations.ui.titleAccent}</strong>,
          })}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="players">
            {t('ui.playersLabel')}
          </label>
          <input
            id="players"
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={1}
            max={30}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          <button type="submit" className={styles.button} disabled={!isValid}>
            {t('ui.startButton')}
          </button>
        </form>

        {!isSpeechRecognitionSupported && (
          <p className={styles.warning}>
            {interpolateJsx(translations.ui.voiceWarning, {
              chrome: <strong>Chrome</strong>,
              edge: <strong>Edge</strong>,
            })}
          </p>
        )}
      </div>
    </div>
  )
}
