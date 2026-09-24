import { useEffect, useMemo, useState } from 'react'
import { playPhotoPop } from '../sounds.js'
import './BabyScreen.css'

const PHOTOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => `/${n}.jpg`)

const SLOTS = [
  { left: '1%', top: '2%' },
  { left: '16%', top: '1%' },
  { right: '1%', top: '2%' },
  { right: '15%', top: '1%' },
  { left: '0%', top: '38%' },
  { right: '0%', top: '40%' },
  { left: '1%', bottom: '6%' },
  { left: '18%', bottom: '2%' },
  { right: '1%', bottom: '5%' },
  { right: '16%', bottom: '2%' },
  { left: '40%', top: '1%' },
]

const BLACK_MS = 2600
const STEP_MS = 420

function generatePlacements() {
  return PHOTOS.map((src, index) => ({
    src,
    slot: SLOTS[index],
    rotate: -12 + Math.random() * 24,
    float: 4 + Math.random() * 2.5,
  }))
}

export default function BabyScreen({ exiting, onScroll }) {
  const placements = useMemo(generatePlacements, [])
  const [lit, setLit] = useState(false)
  const [shown, setShown] = useState(0)
  const [textOn, setTextOn] = useState(false)
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setLit(true), BLACK_MS),
      window.setTimeout(() => setTextOn(true), BLACK_MS + 5 * STEP_MS),
      window.setTimeout(() => setShowScroll(true), BLACK_MS + 5 * STEP_MS + 5000),
    ]

    placements.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => {
          setShown(index + 1)
          playPhotoPop()
        }, BLACK_MS + index * STEP_MS),
      )
    })

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [placements])

  useEffect(() => {
    if (!showScroll || exiting) return undefined

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) > 10) onScroll()
    }

    let touchStartY = 0
    const handleTouchStart = (event) => {
      touchStartY = event.touches[0].clientY
    }
    const handleTouchMove = (event) => {
      if (Math.abs(touchStartY - event.touches[0].clientY) > 30) onScroll()
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [showScroll, exiting, onScroll])

  const screenClass = ['baby-screen', lit ? 'is-lit' : '', exiting ? 'is-exiting' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <section className={screenClass} aria-label="Baby photos">
      <div className="baby-photos" aria-hidden="true">
        {placements.map((photo, index) => (
          <span
            key={photo.src}
            className={index < shown ? 'baby-photo-slot is-shown' : 'baby-photo-slot'}
            style={{
              ...photo.slot,
              '--float': `${photo.float}s`,
            }}
          >
            <img
              className="baby-photo"
              src={photo.src}
              alt=""
              style={{ transform: `rotate(${photo.rotate}deg)` }}
            />
          </span>
        ))}
      </div>

      <div className="baby-center">
        <p className={textOn ? 'baby-text is-on' : 'baby-text'}>
          that is you when u were a baby even tho you are still my baby{' '}
          <span className="baby-heart">❤️</span>
        </p>
      </div>

      <div className={`baby-scroll-cue ${showScroll ? 'is-visible' : ''}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 4v16m0 0l-6-6m6 6l6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>scroll me</span>
      </div>
    </section>
  )
}
