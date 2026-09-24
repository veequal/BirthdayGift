let audioContext
let master
let noiseBuffer
let lastTapAt = 0

const SONG_FILE = 'Lewis Capaldi - Love The Hell Out Of You (Official Lyric Video).mp3'
let song
let songStarted = false

export function startSongOnce() {
  if (songStarted) return
  songStarted = true
  if (!song) {
    song = new Audio(encodeURI(`/${SONG_FILE}`))
    song.preload = 'auto'
  }
  song.loop = false
  song.play().catch(() => {})
}

function getContext() {
  if (audioContext) return audioContext
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  audioContext = new AudioCtx()
  master = audioContext.createGain()
  master.gain.value = 0.35
  master.connect(audioContext.destination)
  return audioContext
}

function noise() {
  const audio = getContext()
  if (!audio) return null
  if (noiseBuffer) return noiseBuffer
  const length = Math.floor(audio.sampleRate * 0.4)
  noiseBuffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1
  return noiseBuffer
}

export function unlockAudio() {
  const audio = getContext()
  if (audio && audio.state === 'suspended') {
    audio.resume()
  }
}

function canPlay() {
  const audio = getContext()
  return Boolean(audio && audio.state === 'running')
}

export function playPhotoPop() {
  if (!canPlay()) return
  const audio = getContext()
  const now = audio.currentTime
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(640, now)
  osc.frequency.exponentialRampToValueAtTime(980, now + 0.07)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14)
  osc.connect(gain)
  gain.connect(master)
  osc.start(now)
  osc.stop(now + 0.16)
}

export function playPaper(isFinal) {
  if (!canPlay()) return
  const audio = getContext()
  const buffer = noise()
  if (!buffer) return
  const now = audio.currentTime
  const source = audio.createBufferSource()
  source.buffer = buffer
  const filter = audio.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = isFinal ? 1400 : 900
  filter.Q.value = 0.7
  const gain = audio.createGain()
  const duration = isFinal ? 0.42 : 0.22
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(isFinal ? 0.16 : 0.08, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(master)
  source.start(now)
  source.stop(now + duration)
}

export function playHeartTap() {
  if (!canPlay()) return
  const nowMs = performance.now()
  if (nowMs - lastTapAt < 160) return
  if (Math.random() > 0.22) return
  lastTapAt = nowMs
  const audio = getContext()
  const buffer = noise()
  if (!buffer) return
  const now = audio.currentTime
  const source = audio.createBufferSource()
  source.buffer = buffer
  const filter = audio.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 1800
  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.035, now + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(master)
  source.start(now)
  source.stop(now + 0.06)
}

export function playBirthday() {
  if (!canPlay()) return
  const audio = getContext()
  const now = audio.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((frequency, index) => {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    const start = now + index * 0.12
    osc.type = 'triangle'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.09, start + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55)
    osc.connect(gain)
    gain.connect(master)
    osc.start(start)
    osc.stop(start + 0.58)
  })
}
