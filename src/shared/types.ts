export const GamePhase = {
  IDLE: 'idle',
  STARTING: 'starting',
  ANNOUNCING: 'announcing',
  WAITING: 'waiting',
  ASKING: 'asking',
  LISTENING: 'listening',
  ENDED: 'ended',
} as const

export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase]

export type Round = {
  action: string
  isSimonSays: boolean
}

export type EndOutcome = 'winner' | 'no-winner'
