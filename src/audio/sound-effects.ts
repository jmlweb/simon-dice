type AudioCtx = AudioContext

let sharedContext: AudioCtx | null = null

const getContext = (): AudioCtx => {
  if (!sharedContext) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    sharedContext = new Ctor()
  }
  return sharedContext
}

export const initAudio = () => {
  const ctx = getContext()
  if (ctx.state === 'suspended') void ctx.resume()
}

type ToneOptions = {
  freq: number
  duration: number
  type?: OscillatorType
  startAt?: number
  gain?: number
}

const playTone = (ctx: AudioCtx, opts: ToneOptions) => {
  const { freq, duration, type = 'sine', startAt = 0, gain = 0.2 } = opts
  const t0 = ctx.currentTime + startAt
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

export const playGameStart = () => {
  const ctx = getContext()
  if (ctx.state === 'suspended') void ctx.resume()
  // Acorde ascendente C major (C5 - E5 - G5)
  playTone(ctx, { freq: 523.25, duration: 0.18, type: 'triangle', startAt: 0 })
  playTone(ctx, { freq: 659.25, duration: 0.18, type: 'triangle', startAt: 0.12 })
  playTone(ctx, { freq: 783.99, duration: 0.32, type: 'triangle', startAt: 0.24 })
}

export const playRoundTick = () => {
  const ctx = getContext()
  if (ctx.state === 'suspended') void ctx.resume()
  playTone(ctx, { freq: 880, duration: 0.08, type: 'square', gain: 0.12 })
}

export const playPlayerCountUpdate = () => {
  const ctx = getContext()
  if (ctx.state === 'suspended') void ctx.resume()
  playTone(ctx, { freq: 1046.5, duration: 0.06, type: 'sine', gain: 0.15 })
  playTone(ctx, {
    freq: 1318.5,
    duration: 0.08,
    type: 'sine',
    startAt: 0.05,
    gain: 0.15,
  })
}

export const playGameEnd = (winner: boolean) => {
  const ctx = getContext()
  if (ctx.state === 'suspended') void ctx.resume()
  if (winner) {
    // Fanfare ascendente
    playTone(ctx, { freq: 523.25, duration: 0.16, type: 'triangle', startAt: 0 })
    playTone(ctx, { freq: 659.25, duration: 0.16, type: 'triangle', startAt: 0.14 })
    playTone(ctx, { freq: 783.99, duration: 0.16, type: 'triangle', startAt: 0.28 })
    playTone(ctx, { freq: 1046.5, duration: 0.5, type: 'triangle', startAt: 0.42 })
  } else {
    // Descenso triste
    playTone(ctx, { freq: 440, duration: 0.2, type: 'sawtooth', startAt: 0, gain: 0.18 })
    playTone(ctx, {
      freq: 349.23,
      duration: 0.2,
      type: 'sawtooth',
      startAt: 0.18,
      gain: 0.18,
    })
    playTone(ctx, {
      freq: 261.63,
      duration: 0.5,
      type: 'sawtooth',
      startAt: 0.36,
      gain: 0.18,
    })
  }
}
