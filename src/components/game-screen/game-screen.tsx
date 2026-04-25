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

const phaseLabel: Record<GamePhase, string> = {
  [GamePhase.IDLE]: '',
  [GamePhase.STARTING]: 'Preparando partida…',
  [GamePhase.ANNOUNCING]: 'Atento…',
  [GamePhase.WAITING]: '',
  [GamePhase.ASKING]: '¿Cuántos quedan?',
  [GamePhase.LISTENING]: 'Te escucho…',
  [GamePhase.ENDED]: '',
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
  const showButtons =
    phase === GamePhase.LISTENING || phase === GamePhase.ASKING
  const buttonsRange = Array.from({ length: playersLeft + 1 }, (_, i) => i)

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.counter}>
          <span className={styles.counterValue}>{playersLeft}</span>
          <span className={styles.counterLabel}>
            {playersLeft === 1 ? 'jugador' : 'jugadores'} de {initialPlayers}
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
            aria-label="Terminar partida"
          >
            Terminar partida
          </button>
        </div>
      </header>

      <main className={styles.stage}>
        {round && phase === GamePhase.ANNOUNCING ? (
          <div className={styles.phrase} data-active="true">
            <div className={styles.action}>
              {round.isSimonSays ? `Simón dice ${round.action}` : round.action}
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.pulse} />
          </div>
        )}

        {voiceFeedback && (
          <p className={styles.voiceFeedback}>{voiceFeedback}</p>
        )}
      </main>

      <footer className={styles.footer}>
        {showButtons && (
          <>
            <p className={styles.helpText}>
              {voiceListening
                ? 'Di cuántos quedan o pulsa un botón'
                : 'Pulsa cuántos jugadores quedan'}
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
