import { useI18n } from '../../i18n'
import { type EndOutcome } from '../../shared/types'
import styles from './end-screen.module.css'

type Props = {
  outcome: EndOutcome
  initialPlayers: number
  onPlayAgain: () => void
}

export const EndScreen = ({ outcome, initialPlayers, onPlayAgain }: Props) => {
  const { t } = useI18n()
  const isWinner = outcome === 'winner'

  return (
    <div className={styles.wrapper}>
      <div className={styles.card} data-outcome={outcome}>
        <div className={styles.emoji}>{isWinner ? '🏆' : '😅'}</div>
        <h1 className={styles.title}>
          {isWinner ? t('ui.winnerTitle') : t('ui.noWinnerTitle')}
        </h1>
        <p className={styles.subtitle}>
          {isWinner
            ? t('ui.winnerSubtitle', { n: initialPlayers })
            : t('ui.noWinnerSubtitle', { n: initialPlayers })}
        </p>
        <button className={styles.button} onClick={onPlayAgain}>
          {t('ui.playAgain')}
        </button>
      </div>
    </div>
  )
}
