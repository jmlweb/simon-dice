import { useState, type FormEvent } from 'react'
import { isSpeechRecognitionSupported } from '../../audio/use-listen'
import styles from './start-screen.module.css'

type Props = {
  onStart: (players: number) => void
}

export const StartScreen = ({ onStart }: Props) => {
  const [value, setValue] = useState('4')
  const trimmed = value.trim()
  const parsed = Number(trimmed)
  const isValid = trimmed !== '' && Number.isInteger(parsed) && parsed >= 1 && parsed <= 30

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) return
    onStart(parsed)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          <span className={styles.titleAccent}>Simón</span> dice
        </h1>
        <p className={styles.subtitle}>
          Escucha bien. Solo haz lo que diga <strong>Simón</strong>.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="players">
            ¿Cuántos jugadores hay?
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
          <button
            type="submit"
            className={styles.button}
            disabled={!isValid}
          >
            Comenzar
          </button>
        </form>

        {!isSpeechRecognitionSupported && (
          <p className={styles.warning}>
            ⚠️ Tu navegador no soporta reconocimiento de voz. Podrás jugar igualmente
            usando los botones que aparecerán durante la partida. Para una experiencia
            completa, abre el juego en <strong>Chrome</strong> o <strong>Edge</strong>.
          </p>
        )}
      </div>
    </div>
  )
}
