import { useCallback, useEffect, useState } from 'react'
import BabyScreen from './components/BabyScreen.jsx'
import CelebrationScreen from './components/CelebrationScreen.jsx'
import LetterScreen from './components/LetterScreen.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import PasswordScreen from './components/PasswordScreen.jsx'
import { unlockAudio } from './sounds.js'
import './App.css'

export default function App() {
  const [phase, setPhase] = useState('passcode')

  const unlock = useCallback(() => {
    setPhase((current) => (current === 'passcode' ? 'exit' : current))
  }, [])

  useEffect(() => {
    const resume = () => unlockAudio()
    window.addEventListener('pointerdown', resume)
    window.addEventListener('keydown', resume)
    return () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'exit') return undefined

    const timer = window.setTimeout(() => {
      setPhase('loading')
    }, 700)

    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'loading') return undefined

    const timer = window.setTimeout(() => {
      setPhase('loading-leave')
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'loading-leave') return undefined

    const timer = window.setTimeout(() => {
      setPhase('letter')
    }, 720)

    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'letter-leave') return undefined

    const timer = window.setTimeout(() => {
      setPhase('baby')
    }, 720)

    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'baby-leave') return undefined

    const timer = window.setTimeout(() => {
      setPhase('celebration')
    }, 800)

    return () => window.clearTimeout(timer)
  }, [phase])

  const showPasscode = phase === 'passcode' || phase === 'exit'
  const showLoading = phase === 'exit' || phase === 'loading' || phase === 'loading-leave'
  const showLetter = phase === 'loading-leave' || phase === 'letter' || phase === 'letter-leave'
  const showBaby = phase === 'letter-leave' || phase === 'baby' || phase === 'baby-leave'
  const showCelebration = phase === 'baby-leave' || phase === 'celebration'

  return (
    <div className="stage">
      {showCelebration && <CelebrationScreen key="celebration" />}
      {showBaby && (
        <BabyScreen
          key="baby"
          exiting={phase === 'baby-leave'}
          onScroll={() => setPhase('baby-leave')}
        />
      )}
      {showLetter && (
        <LetterScreen
          key="letter"
          exiting={phase === 'letter-leave'}
          onDone={() => setPhase('letter-leave')}
        />
      )}
      {showLoading && (
        <LoadingScreen key="loading" exiting={phase === 'loading-leave'} />
      )}
      {showPasscode && (
        <PasswordScreen key="passcode" exiting={phase === 'exit'} onUnlock={unlock} />
      )}
    </div>
  )
}
