import { EndScreen } from './components/end-screen/end-screen'
import { GameScreen } from './components/game-screen/game-screen'
import { StartScreen } from './components/start-screen/start-screen'
import { useGame } from './game/use-game'
import { GamePhase } from './shared/types'

export const App = () => {
  const game = useGame()

  if (game.phase === GamePhase.IDLE) {
    return <StartScreen onStart={game.start} />
  }

  if (game.phase === GamePhase.ENDED && game.outcome) {
    return (
      <EndScreen
        outcome={game.outcome}
        initialPlayers={game.initialPlayers}
        onPlayAgain={game.reset}
      />
    )
  }

  return (
    <GameScreen
      phase={game.phase}
      playersLeft={game.playersLeft}
      initialPlayers={game.initialPlayers}
      round={game.round}
      voiceListening={game.voiceListening}
      voiceFeedback={game.voiceFeedback}
      onSubmitRemaining={game.submitRemaining}
      onEndGame={game.reset}
    />
  )
}
