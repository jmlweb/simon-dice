import type { Round } from '../shared/types'

const SIMON_SAYS_PROBABILITY = 0.65

export const pickRound = (actions: readonly string[], previousAction?: string): Round => {
  if (actions.length === 0) {
    return { action: '', isSimonSays: false }
  }
  let action = actions[0]
  do {
    action = actions[Math.floor(Math.random() * actions.length)]
  } while (action === previousAction && actions.length > 1)

  const isSimonSays = Math.random() < SIMON_SAYS_PROBABILITY
  return { action, isSimonSays }
}

export const buildPhrase = (action: string, isSimonSays: boolean, simonTemplate: string) =>
  isSimonSays ? simonTemplate.replace('{action}', action) : action
