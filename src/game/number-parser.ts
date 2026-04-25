const stripDiacritics = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '')

const cleanPunct = (text: string) =>
  text.replace(/[.,;:!?¡¿。、！？]/g, '').trim()

const normalize = (text: string) => stripDiacritics(text.toLowerCase()).trim()

export const parseNumber = (
  text: string,
  max: number,
  wordsToNumber: Record<string, number>,
): number | null => {
  if (!text) return null
  const lower = text.toLowerCase().trim()

  const digitMatch = lower.match(/-?\d+/)
  if (digitMatch) {
    const n = Number(digitMatch[0])
    if (Number.isFinite(n) && n >= 0 && n <= max) return n
  }

  const tryLookup = (key: string) => {
    if (key && key in wordsToNumber) {
      const n = wordsToNumber[key]
      if (n >= 0 && n <= max) return n
    }
    return null
  }

  const normalized = normalize(lower)

  // Idiomas con espacios entre palabras (latinos)
  const tokens = normalized.split(/\s+/).map(cleanPunct).filter(Boolean)
  for (const token of tokens) {
    const found = tryLookup(token)
    if (found !== null) return found
  }

  // Coincidencia directa con todo el texto normalizado (útil cuando hay espacios entre cifras)
  const fullNormalized = cleanPunct(normalized.replace(/\s+/g, ''))
  const direct = tryLookup(fullNormalized)
  if (direct !== null) return direct

  // CJK / texto sin diacríticos sin lower (kanji/kana/hanzi no cambian con lower)
  // El lower puede romper variantes con tono (pīnyīn): probamos ambas formas
  const fullRaw = cleanPunct(text.replace(/\s+/g, ''))
  const directRaw = tryLookup(fullRaw)
  if (directRaw !== null) return directRaw

  // Búsqueda por sub-cadena más larga (útil para CJK donde el motor concatena)
  // Iteramos las claves ordenadas por longitud descendente y comprobamos si aparecen
  const candidates = [fullRaw, fullNormalized]
  const sortedKeys = Object.keys(wordsToNumber).sort((a, b) => b.length - a.length)
  for (const candidate of candidates) {
    if (!candidate) continue
    for (const key of sortedKeys) {
      if (key.length < 1) continue
      if (candidate.includes(key)) {
        const n = wordsToNumber[key]
        if (n >= 0 && n <= max) return n
      }
    }
  }

  return null
}
