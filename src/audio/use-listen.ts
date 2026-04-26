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

export const ListenError = {
  NOT_SUPPORTED: 'not-supported',
  NOT_ALLOWED: 'not-allowed',
  AUDIO_CAPTURE: 'audio-capture',
  NO_SPEECH: 'no-speech',
  NETWORK: 'network',
  ABORTED: 'aborted',
} as const

export type ListenError = (typeof ListenError)[keyof typeof ListenError]

export type ListenResult = {
  alternatives: string[] | null
  error: ListenError | null
}

const getCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export const isSpeechRecognitionSupported = getCtor() !== null

const mapRecognitionError = (raw: string): ListenError => {
  switch (raw) {
    case 'not-allowed':
    case 'service-not-allowed':
      return ListenError.NOT_ALLOWED
    case 'audio-capture':
      return ListenError.AUDIO_CAPTURE
    case 'network':
      return ListenError.NETWORK
    case 'aborted':
      return ListenError.ABORTED
    default:
      return ListenError.NO_SPEECH
  }
}

// Pedir el permiso del micrófono explícitamente. SpeechRecognition lo solicita
// implícitamente, pero en escritorio (Chrome/Edge) el prompt es a veces silenciado
// y la API falla sin avisar. Forzando getUserMedia conseguimos un diálogo claro
// y un error tipado si el usuario lo deniega o no hay micro.
const ensureMicPermission = async (): Promise<ListenError | null> => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return null
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    return null
  } catch (err) {
    const name = (err as DOMException | undefined)?.name
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      return ListenError.NOT_ALLOWED
    }
    if (name === 'NotFoundError' || name === 'OverconstrainedError') {
      return ListenError.AUDIO_CAPTURE
    }
    return ListenError.AUDIO_CAPTURE
  }
}

export const useListen = (lang: string) => {
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const resolveRef = useRef<((value: ListenResult) => void) | null>(null)
  const langRef = useRef(lang)
  const permissionPromiseRef = useRef<Promise<ListenError | null> | null>(null)
  const permissionErrorRef = useRef<ListenError | null>(null)

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
      resolveRef.current({ alternatives: null, error: ListenError.ABORTED })
      resolveRef.current = null
    }
    recRef.current = null
  }, [])

  const listen = useCallback(async (): Promise<ListenResult> => {
    const Ctor = getCtor()
    if (!Ctor) return { alternatives: null, error: ListenError.NOT_SUPPORTED }

    if (permissionErrorRef.current) {
      return { alternatives: null, error: permissionErrorRef.current }
    }
    if (!permissionPromiseRef.current) {
      permissionPromiseRef.current = ensureMicPermission()
    }
    const permError = await permissionPromiseRef.current
    if (permError) {
      permissionErrorRef.current = permError
      return { alternatives: null, error: permError }
    }

    return new Promise<ListenResult>((resolve) => {
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
      let pendingError: ListenError | null = null

      const settle = (value: ListenResult) => {
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
        settle({
          alternatives: candidates.length > 0 ? candidates : null,
          error: candidates.length > 0 ? null : ListenError.NO_SPEECH,
        })
      }
      rec.onerror = (event) => {
        const code = mapRecognitionError(event.error)
        if (code === ListenError.NOT_ALLOWED || code === ListenError.AUDIO_CAPTURE) {
          permissionErrorRef.current = code
        }
        pendingError = code
      }
      rec.onend = () => {
        settle({ alternatives: null, error: pendingError ?? ListenError.NO_SPEECH })
      }

      recRef.current = rec
      resolveRef.current = settle
      try {
        rec.start()
      } catch {
        settle({ alternatives: null, error: ListenError.ABORTED })
      }
    })
  }, [])

  return { listen, stop, isSupported: isSpeechRecognitionSupported }
}
