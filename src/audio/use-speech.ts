import { useCallback, useEffect, useRef } from 'react'

type SpeakOptions = {
  rate?: number
  pitch?: number
  volume?: number
}

const isSpeechSynthesisSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

// Heurística de calidad: las voces compactas/eSpeak suenan robóticas; las
// "Google …" en Chrome y las "Enhanced/Premium/Neural" en macOS suenan mucho mejor.
const QUALITY_HINTS = [
  'google',
  'natural',
  'neural',
  'premium',
  'enhanced',
  'online',
  'wavenet',
  'siri',
]
const POOR_HINTS = ['compact', 'espeak', 'novelty', 'eloquence']

const scoreVoice = (voice: SpeechSynthesisVoice, lang: string): number => {
  const name = voice.name.toLowerCase()
  const voiceLang = voice.lang.replace('_', '-').toLowerCase()
  const targetLang = lang.toLowerCase()
  const targetBase = targetLang.split('-')[0]
  const voiceBase = voiceLang.split('-')[0]

  let score: number
  if (voiceLang === targetLang) score = 100
  else if (voiceBase === targetBase) score = 50
  else return -Infinity

  for (const hint of QUALITY_HINTS) {
    if (name.includes(hint)) score += 30
  }
  for (const hint of POOR_HINTS) {
    if (name.includes(hint)) score -= 50
  }

  // En Chrome las voces de red (Google) tienen localService=false y son las buenas
  if (!voice.localService) score += 25

  if (voice.default) score += 5

  return score
}

const pickVoice = (lang: string): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisSupported) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  let best: SpeechSynthesisVoice | null = null
  let bestScore = -Infinity
  for (const voice of voices) {
    const score = scoreVoice(voice, lang)
    if (score > bestScore) {
      bestScore = score
      best = voice
    }
  }
  return best
}

export const useSpeech = (lang: string) => {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)
  const langRef = useRef(lang)

  useEffect(() => {
    langRef.current = lang
    if (isSpeechSynthesisSupported) {
      voiceRef.current = pickVoice(lang)
    }
  }, [lang])

  useEffect(() => {
    if (!isSpeechSynthesisSupported) return
    const refresh = () => {
      voiceRef.current = pickVoice(langRef.current)
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
        utter.lang = langRef.current
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
