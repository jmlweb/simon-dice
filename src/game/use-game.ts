import { useCallback, useEffect, useRef, useState } from 'react'
import {
  initAudio,
  playGameEnd,
  playGameStart,
  playPlayerCountUpdate,
  playRoundTick,
} from '../audio/sound-effects'
import { isSpeechRecognitionSupported, useListen } from '../audio/use-listen'
import { useSpeech } from '../audio/use-speech'
import { SPEECH_TAGS, useI18n } from '../i18n'
import { GamePhase, type EndOutcome, type Round } from '../shared/types'
import { buildPhrase, pickRound } from './actions'
import { parseNumber } from './number-parser'

const ACTION_WAIT_MS = 5000
const ROUND_PAUSE_MS = 800
const VOICE_RETRY_LIMIT = 2

type State = {
  phase: GamePhase
  playersLeft: number
  initialPlayers: number
  round: Round | null
  outcome: EndOutcome | null
  voiceListening: boolean
  voiceFeedback: string | null
}

const INITIAL: State = {
  phase: GamePhase.IDLE,
  playersLeft: 0,
  initialPlayers: 0,
  round: null,
  outcome: null,
  voiceListening: false,
  voiceFeedback: null,
}

const ABORT = Symbol('abort')

export const useGame = () => {
  const { locale, translations } = useI18n()
  const speechTag = SPEECH_TAGS[locale]

  const [state, setState] = useState<State>(INITIAL)
  const { speak, cancel: cancelSpeech } = useSpeech(speechTag)
  const { listen, stop: stopListen } = useListen(speechTag)

  const sessionRef = useRef(0)
  const manualAnswerRef = useRef<((n: number | typeof ABORT) => void) | null>(null)
  const translationsRef = useRef(translations)

  useEffect(() => {
    translationsRef.current = translations
  }, [translations])

  const isAlive = (session: number) => sessionRef.current === session

  const wait = (ms: number, session: number) =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(isAlive(session)), ms)
    })

  const submitRemaining = useCallback((n: number) => {
    manualAnswerRef.current?.(n)
  }, [])

  const reset = useCallback(() => {
    sessionRef.current += 1
    cancelSpeech()
    stopListen()
    manualAnswerRef.current?.(ABORT)
    manualAnswerRef.current = null
    setState(INITIAL)
  }, [cancelSpeech, stopListen])

  const askForAnswer = useCallback(
    async (max: number, session: number): Promise<number | null> => {
      for (let attempt = 0; attempt < VOICE_RETRY_LIMIT; attempt++) {
        if (!isAlive(session)) return null

        const numberWords = translationsRef.current.numberWords
        const voicePromise: Promise<number | null> = isSpeechRecognitionSupported
          ? listen().then((alts) => {
              if (!alts) return null
              for (const transcript of alts) {
                const n = parseNumber(transcript, max, numberWords)
                if (n !== null) return n
              }
              return null
            })
          : new Promise(() => {})

        const manualPromise = new Promise<number | typeof ABORT>((resolve) => {
          manualAnswerRef.current = resolve
        })

        const result = await Promise.race([voicePromise, manualPromise])
        manualAnswerRef.current = null
        if (!isAlive(session)) return null
        if (result === ABORT) return null

        if (typeof result === 'number' && result >= 0 && result <= max) {
          return result
        }

        if (attempt < VOICE_RETRY_LIMIT - 1 && isSpeechRecognitionSupported) {
          const msg = translationsRef.current.speech.notUnderstood
          setState((s) => ({ ...s, voiceFeedback: msg }))
          await speak(msg)
          if (!isAlive(session)) return null
        }
      }

      stopListen()
      setState((s) => ({ ...s, voiceListening: false }))
      const manualOnly = await new Promise<number | typeof ABORT>((resolve) => {
        manualAnswerRef.current = resolve
      })
      manualAnswerRef.current = null
      if (!isAlive(session)) return null
      if (manualOnly === ABORT) return null
      return manualOnly
    },
    [listen, speak, stopListen],
  )

  const runLoop = useCallback(
    async (initialPlayers: number) => {
      sessionRef.current += 1
      const session = sessionRef.current
      let players = initialPlayers
      let previousAction: string | undefined

      setState({
        phase: GamePhase.STARTING,
        playersLeft: initialPlayers,
        initialPlayers,
        round: null,
        outcome: null,
        voiceListening: false,
        voiceFeedback: null,
      })

      playGameStart()
      const startMessage =
        initialPlayers === 1
          ? translationsRef.current.speech.gameStartSingle
          : translationsRef.current.speech.gameStartPlural.replace(
              '{n}',
              String(initialPlayers),
            )
      await speak(startMessage)
      if (!isAlive(session)) return

      while (players > 1) {
        const t = translationsRef.current
        const round = pickRound(t.actions, previousAction)
        previousAction = round.action

        setState((s) => ({
          ...s,
          phase: GamePhase.ANNOUNCING,
          round,
          voiceFeedback: null,
        }))
        playRoundTick()
        await speak(buildPhrase(round.action, round.isSimonSays, t.speech.simonSays))
        if (!isAlive(session)) return

        setState((s) => ({ ...s, phase: GamePhase.WAITING }))
        if (!(await wait(ACTION_WAIT_MS, session))) return

        setState((s) => ({ ...s, phase: GamePhase.ASKING }))
        await speak(translationsRef.current.speech.askRemaining)
        if (!isAlive(session)) return

        setState((s) => ({
          ...s,
          phase: GamePhase.LISTENING,
          voiceListening: isSpeechRecognitionSupported,
        }))

        const answer = await askForAnswer(players, session)
        if (answer === null) return

        players = answer
        playPlayerCountUpdate()
        setState((s) => ({
          ...s,
          playersLeft: players,
          voiceListening: false,
          voiceFeedback: null,
        }))

        if (players <= 1) break
        if (!(await wait(ROUND_PAUSE_MS, session))) return
      }

      const outcome: EndOutcome = players === 1 ? 'winner' : 'no-winner'
      playGameEnd(outcome === 'winner')
      setState((s) => ({
        ...s,
        phase: GamePhase.ENDED,
        playersLeft: players,
        outcome,
        voiceListening: false,
      }))
      const ending =
        outcome === 'winner'
          ? translationsRef.current.speech.winnerEnding
          : translationsRef.current.speech.noWinnerEnding
      await speak(ending)
    },
    [askForAnswer, speak],
  )

  const start = useCallback(
    (n: number) => {
      if (n < 1) return
      initAudio()
      void runLoop(n).catch((err) => {
        console.error('[simon-dice] loop error', err)
      })
    },
    [runLoop],
  )

  useEffect(
    () => () => {
      sessionRef.current += 1
      cancelSpeech()
      stopListen()
      manualAnswerRef.current = null
    },
    [cancelSpeech, stopListen],
  )

  return {
    phase: state.phase,
    playersLeft: state.playersLeft,
    initialPlayers: state.initialPlayers,
    round: state.round,
    outcome: state.outcome,
    voiceListening: state.voiceListening,
    voiceFeedback: state.voiceFeedback,
    start,
    submitRemaining,
    reset,
  }
}
