import { useCallback, useEffect, useRef } from 'react'

type SpeechRecognitionLike = EventTarget & {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionAlternativeLike = { transcript: string }
type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionAlternativeLike> & {
  isFinal: boolean
}
type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>
}

type SpeechRecognitionErrorEventLike = {
  error: string
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

const getCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export const isSpeechRecognitionSupported = getCtor() !== null

export const useListen = (lang: string) => {
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const resolveRef = useRef<((value: string[] | null) => void) | null>(null)
  const langRef = useRef(lang)

  useEffect(() => {
    langRef.current = lang
  }, [lang])

  useEffect(
    () => () => {
      try {
        recRef.current?.abort()
      } catch {
        // ignore
      }
      recRef.current = null
      resolveRef.current = null
    },
    [],
  )

  const stop = useCallback(() => {
    try {
      recRef.current?.abort()
    } catch {
      // ignore
    }
    if (resolveRef.current) {
      resolveRef.current(null)
      resolveRef.current = null
    }
    recRef.current = null
  }, [])

  const listen = useCallback((): Promise<string[] | null> => {
    const Ctor = getCtor()
    if (!Ctor) return Promise.resolve(null)

    return new Promise<string[] | null>((resolve) => {
      if (recRef.current) {
        try {
          recRef.current.abort()
        } catch {
          // ignore
        }
      }
      const rec = new Ctor()
      rec.lang = langRef.current
      rec.continuous = false
      rec.interimResults = false
      rec.maxAlternatives = 5

      let settled = false
      const settle = (value: string[] | null) => {
        if (settled) return
        settled = true
        resolveRef.current = null
        recRef.current = null
        resolve(value)
      }

      rec.onresult = (event) => {
        const candidates: string[] = []
        const seen = new Set<string>()
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i]
          for (let j = 0; j < result.length; j++) {
            const transcript = result[j]?.transcript?.trim()
            if (transcript && !seen.has(transcript)) {
              seen.add(transcript)
              candidates.push(transcript)
            }
          }
        }
        settle(candidates.length > 0 ? candidates : null)
      }
      rec.onerror = () => settle(null)
      rec.onend = () => settle(null)

      recRef.current = rec
      resolveRef.current = settle
      try {
        rec.start()
      } catch {
        settle(null)
      }
    })
  }, [])

  return { listen, stop, isSupported: isSpeechRecognitionSupported }
}
