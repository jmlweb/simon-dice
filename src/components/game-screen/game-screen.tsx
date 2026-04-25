import { useI18n } from '../../i18n'
import { GamePhase, type Round } from '../../shared/types'
import styles from './game-screen.module.css'

type Props = {
  phase: GamePhase
  playersLeft: number
  initialPlayers: number
  round: Round | null
  voiceListening: boolean
  voiceFeedback: string | null
  onSubmitRemaining: (n: number) => void
  onEndGame: () => void
}

export const GameScreen = ({
  phase,
  playersLeft,
  initialPlayers,
  round,
  voiceListening,
  voiceFeedback,
  onSubmitRemaining,
  onEndGame,
}: Props) => {
  const { t, translations } = useI18n()

  const phaseLabel: Record<GamePhase, string> = {
    [GamePhase.IDLE]: '',
    [GamePhase.STARTING]: t('ui.phasePreparing'),
    [GamePhase.ANNOUNCING]: t('ui.phaseAnnouncing'),
    [GamePhase.WAITING]: '',
    [GamePhase.ASKING]: t('ui.phaseAsking'),
    [GamePhase.LISTENING]: t('ui.phaseListening'),
    [GamePhase.ENDED]: '',
  }

  const showButtons = phase === GamePhase.LISTENING || phase === GamePhase.ASKING
  const buttonsRange = Array.from({ length: playersLeft + 1 }, (_, i) => i)
  const counterUnit =
    playersLeft === 1 ? translations.ui.playerSingular : translations.ui.playerPlural

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.counter}>
          <span className={styles.counterValue}>{playersLeft}</span>
          <span className={styles.counterLabel}>
            {counterUnit} {t('ui.of')} {initialPlayers}
          </span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.phaseTag} data-phase={phase}>
            {phaseLabel[phase]}
          </div>
          <button
            type="button"
            className={styles.endButton}
            onClick={onEndGame}
            aria-label={t('ui.endButtonAria')}
          >
            {t('ui.endButton')}
          </button>
        </div>
      </header>

      <main className={styles.stage}>
        {round && phase === GamePhase.ANNOUNCING ? (
          <div className={styles.phrase} data-active="true">
            <div className={styles.action}>
              {round.isSimonSays
                ? translations.speech.simonSays.replace('{action}', round.action)
                : round.action}
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.pulse} />
          </div>
        )}

        {voiceFeedback && <p className={styles.voiceFeedback}>{voiceFeedback}</p>}
      </main>

      <footer className={styles.footer}>
        {showButtons && (
          <>
            <p className={styles.helpText}>
              {voiceListening ? t('ui.helpVoice') : t('ui.helpManual')}
            </p>
            <div className={styles.buttons}>
              {buttonsRange.map((n) => (
                <button
                  key={n}
                  className={styles.numberButton}
                  onClick={() => onSubmitRemaining(n)}
                  disabled={phase !== GamePhase.LISTENING}
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
      </footer>
    </div>
  )
}
