export const ACTIONS = [
  'tócate la nariz',
  'tócate la oreja izquierda',
  'tócate la oreja derecha',
  'tócate la cabeza',
  'tócate los hombros',
  'tócate las rodillas',
  'tócate los pies',
  'salta una vez',
  'salta dos veces',
  'da una palmada',
  'da tres palmadas',
  'gira sobre ti mismo',
  'levanta la mano derecha',
  'levanta la mano izquierda',
  'levanta los dos brazos',
  'cierra los ojos',
  'abre la boca',
  'saca la lengua',
  'siéntate',
  'levántate',
  'agáchate',
  'ponte a la pata coja',
  'cruza los brazos',
  'sonríe',
  'haz una mueca',
] as const

export type Action = (typeof ACTIONS)[number]

const SIMON_SAYS_PROBABILITY = 0.65

export const pickRound = (previousAction?: string) => {
  let action: Action
  do {
    action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)]
  } while (action === previousAction && ACTIONS.length > 1)

  const isSimonSays = Math.random() < SIMON_SAYS_PROBABILITY
  return { action, isSimonSays }
}

export const buildPhrase = (action: string, isSimonSays: boolean) =>
  isSimonSays ? `Simón dice ${action}` : action
