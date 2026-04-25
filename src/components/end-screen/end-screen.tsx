import { type EndOutcome } from '../../shared/types'
import styles from './end-screen.module.css'

type Props = {
  outcome: EndOutcome
  initialPlayers: number
  onPlayAgain: () => void
}

export const EndScreen = ({ outcome, initialPlayers, onPlayAgain }: Props) => {
  const isWinner = outcome === 'winner'

  return (
    <div className={styles.wrapper}>
      <div className={styles.card} data-outcome={outcome}>
        <div className={styles.emoji}>{isWinner ? '🏆' : '😅'}</div>
        <h1 className={styles.title}>
          {isWinner ? '¡Tenemos un ganador!' : 'Nadie quedó en pie'}
        </h1>
        <p className={styles.subtitle}>
          {isWinner
            ? `Empezasteis ${initialPlayers}, queda 1.`
            : `Empezasteis ${initialPlayers}, no queda nadie.`}
        </p>
        <button className={styles.button} onClick={onPlayAgain}>
          Jugar otra vez
        </button>
      </div>
    </div>
  )
}
