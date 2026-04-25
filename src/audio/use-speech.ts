import { useCallback, useEffect, useRef } from 'react'

type SpeakOptions = {
  rate?: number
  pitch?: number
  volume?: number
}

const isSpeechSynthesisSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

const pickSpanishVoice = (): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisSupported) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  return (
    voices.find((v) => v.lang === 'es-ES') ||
    voices.find((v) => v.lang.startsWith('es')) ||
    null
  )
}

export const useSpeech = () => {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!isSpeechSynthesisSupported) return
    const refresh = () => {
      voiceRef.current = pickSpanishVoice()
    }
    refresh()
    window.speechSynthesis.addEventListener('voiceschanged', refresh)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refresh)
      window.speechSynthesis.cancel()
      utterRef.current = null
    }
  }, [])

  const speak = useCallback(
    (text: string, opts: SpeakOptions = {}) =>
      new Promise<void>((resolve) => {
        if (!isSpeechSynthesisSupported) {
          resolve()
          return
        }
        window.speechSynthesis.cancel()
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang = 'es-ES'
        if (voiceRef.current) utter.voice = voiceRef.current
        utter.rate = opts.rate ?? 1
        utter.pitch = opts.pitch ?? 1
        utter.volume = opts.volume ?? 1
        utter.onend = () => resolve()
        utter.onerror = () => resolve()
        utterRef.current = utter
        window.speechSynthesis.speak(utter)
      }),
    [],
  )

  const cancel = useCallback(() => {
    if (!isSpeechSynthesisSupported) return
    window.speechSynthesis.cancel()
  }, [])

  return { speak, cancel, isSupported: isSpeechSynthesisSupported }
}
