import { useState } from 'react'
import { playPaper } from '../sounds.js'
import './LetterScreen.css'

const NOTES = {
  'top-left': 'who unfolds from their left hand',
  'bottom-left': 'so you wanna read upside down and unfold with your left hand?',
  'bottom-right': 'you wanna read upside down?',
}

function CornerArrow({ direction }) {
  const rotation = {
    'top-left': -135,
    'top-right': -45,
    'bottom-left': 135,
    'bottom-right': 45,
  }[direction]

  return (
    <svg className="fold-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <g transform={`rotate(${rotation} 12 12)`}>
        <path
          d="M5 12h12M13 6l6 6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

function FoldControl({ direction, onClick }) {
  return (
    <button type="button" className={`fold-hint fold-hint-${direction}`} onClick={onClick}>
      <CornerArrow direction={direction} />
      <span>fold from here</span>
    </button>
  )
}

export default function LetterScreen({ exiting, onDone }) {
  const [step, setStep] = useState(0)
  const [note, setNote] = useState('')
  const [shaking, setShaking] = useState(false)
  const [paperMove, setPaperMove] = useState(false)

  function nudgePaper() {
    setPaperMove(true)
    window.setTimeout(() => setPaperMove(false), 700)
  }

  function tease(direction) {
    if (step >= 3) return
    setNote(NOTES[direction])
    nudgePaper()
    setShaking(true)
    window.setTimeout(() => setShaking(false), 480)
  }

  function unfoldFromTopRight() {
    if (step >= 3) return
    const next = step + 1
    setStep(next)
    setNote(next < 3 ? 'unfold more' : '')
    nudgePaper()
    playPaper(next === 3)
  }

  const frameClass = [
    'letter-frame',
    `is-step-${step}`,
    shaking ? 'is-shaking' : '',
    paperMove ? 'is-moving' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const screenClass = ['letter-screen', exiting ? 'is-exiting' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <section className={screenClass} aria-label="Letter">
      <p className="letter-note" role="status">
        {note}
      </p>

      <div className={frameClass}>
        {step < 3 && (
          <>
            <FoldControl direction="top-left" onClick={() => tease('top-left')} />
            <FoldControl direction="top-right" onClick={unfoldFromTopRight} />
            <FoldControl direction="bottom-left" onClick={() => tease('bottom-left')} />
            <FoldControl direction="bottom-right" onClick={() => tease('bottom-right')} />
          </>
        )}

        <div className="letter-sheet">
          <div className="letter-flap letter-flap-top" />
          <div className="letter-flap letter-flap-bottom" />
          <div className="letter-crease" aria-hidden="true" />
          <article className="letter-copy" hidden={step < 3}>
            <p>Dear Sarah,</p>
            <p>
              We first talked on the 14th of April, and since that day, I had one goal in my head: to eventually marry the love of my life — you.
            </p>
            <p>
              Today, you turn 18, and I want to wish a very happy birthday to my only woman in the world. ❤️
            </p>
            <p>
              We&apos;ve shared bad days and really good ones, but through all of them, one thought in my head has always stayed the same: I want us to build a family together.
            </p>
            <p>
              Ever since I met you, so many things started reminding me of you. Pink things, cute cats, cute babies, beautiful flowers, hearts, doctors... and honestly, a lot more than I could ever list.
            </p>
            <p>
              You&apos;re my favorite when you&apos;re simply being yourself. I don&apos;t want you to be anyone else, because there is no girl in the world who could ever replace you.
            </p>
            <p>And to me, you&apos;re the prettiest girl ever.</p>
            <p>Happy birthday, my love. ❤️</p>
          </article>
        </div>
      </div>

      {step === 3 && (
        <button type="button" className="read-button" onClick={onDone}>
          i read it all
        </button>
      )}
    </section>
  )
}
