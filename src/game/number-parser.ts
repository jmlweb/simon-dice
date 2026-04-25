const WORDS_TO_NUMBER: Record<string, number> = {
  cero: 0,
  ninguno: 0,
  ninguna: 0,
  nadie: 0,
  uno: 1,
  una: 1,
  un: 1,
  ueno: 1,
  uvo: 1,
  dos: 2,
  doss: 2,
  dios: 2,
  voz: 2,
  tres: 3,
  tras: 3,
  tré: 3,
  trex: 3,
  cuatro: 4,
  cuatros: 4,
  cinco: 5,
  cinto: 5,
  cisco: 5,
  cinso: 5,
  finco: 5,
  seis: 6,
  seys: 6,
  ses: 6,
  sis: 6,
  siete: 7,
  siet: 7,
  sieto: 7,
  ciete: 7,
  ocho: 8,
  bocho: 8,
  hocho: 8,
  nueve: 9,
  nuebe: 9,
  nuef: 9,
  diez: 10,
  dies: 10,
  diés: 10,
  once: 11,
  onse: 11,
  doce: 12,
  dose: 12,
  trece: 13,
  trese: 13,
  catorce: 14,
  catorse: 14,
  quince: 15,
  quinse: 15,
  kinse: 15,
  dieciséis: 16,
  dieciseis: 16,
  dieciseys: 16,
  diecisiete: 17,
  diesisiete: 17,
  dieciocho: 18,
  diesiocho: 18,
  diecinueve: 19,
  diesinueve: 19,
  veinte: 20,
  beinte: 20,
  veintiuno: 21,
  beintiuno: 21,
  veintidós: 22,
  veintidos: 22,
  beintidos: 22,
  veintitrés: 23,
  veintitres: 23,
  beintitres: 23,
  veinticuatro: 24,
  beinticuatro: 24,
  veinticinco: 25,
  beinticinco: 25,
  veintiséis: 26,
  veintiseis: 26,
  beintiseis: 26,
  veintisiete: 27,
  beintisiete: 27,
  veintiocho: 28,
  beintiocho: 28,
  veintinueve: 29,
  beintinueve: 29,
  treinta: 30,
  treynta: 30,
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
