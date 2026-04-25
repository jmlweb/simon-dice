const WORDS_TO_NUMBER: Record<string, number> = {
  cero: 0,
  ninguno: 0,
  ninguna: 0,
  nadie: 0,
  uno: 1,
  una: 1,
  un: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciséis: 16,
  dieciseis: 16,
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20,
  veintiuno: 21,
  veintidós: 22,
  veintidos: 22,
  veintitrés: 23,
  veintitres: 23,
  veinticuatro: 24,
  veinticinco: 25,
  veintiséis: 26,
  veintiseis: 26,
  veintisiete: 27,
  veintiocho: 28,
  veintinueve: 29,
  treinta: 30,
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()

export const parseNumber = (text: string, max: number): number | null => {
  if (!text) return null
  const lower = text.toLowerCase().trim()

  const digitMatch = lower.match(/-?\d+/)
  if (digitMatch) {
    const n = Number(digitMatch[0])
    if (Number.isFinite(n) && n >= 0 && n <= max) return n
  }

  const tokens = normalize(lower).split(/\s+/)
  for (const token of tokens) {
    const clean = token.replace(/[.,;:!?¡¿]/g, '')
    if (clean in WORDS_TO_NUMBER) {
      const n = WORDS_TO_NUMBER[clean]
      if (n >= 0 && n <= max) return n
    }
  }
  return null
}
