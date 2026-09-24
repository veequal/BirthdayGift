import { useCallback, useEffect, useRef, useState } from 'react'
import { PASSCODE } from '../config.js'
import { startSongOnce } from '../sounds.js'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

function DeleteIcon() {
  return (
    <svg viewBox="0 0 26 20" aria-hidden="true">
      <path
        d="M9.2 1.6h12.2A2.4 2.4 0 0 1 23.8 4v12a2.4 2.4 0 0 1-2.4 2.4H9.2c-.7 0-1.36-.3-1.82-.84L1.9 11.1a1.7 1.7 0 0 1 0-2.2L7.38 2.44A2.4 2.4 0 0 1 9.2 1.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12.1 7.1 18 13M18 7.1l-5.9 5.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function PasswordScreen({ onUnlock, exiting }) {
  const [code, setCode] = useState('')
  const [shake, setShake] = useState(false)
  const busy = useRef(false)

  const press = useCallback(
    (digit) => {
      if (busy.current || exiting) return

      setCode((current) => {
        if (current.length >= PASSCODE.length) return current
        const next = `${current}${digit}`
        if (next.length === PASSCODE.length) busy.current = true
        if (next === PASSCODE) startSongOnce()
        return next
      })
    },
    [exiting],
  )

  const backspace = useCallback(() => {
    if (busy.current || exiting) return
    setCode((current) => current.slice(0, -1))
  }, [exiting])

  useEffect(() => {
    if (code.length !== PASSCODE.length || !busy.current) return undefined

    let resetTimer = 0
    const timer = window.setTimeout(() => {
      if (code === PASSCODE) {
        onUnlock()
        return
      }

      setShake(true)
      resetTimer = window.setTimeout(() => {
        setCode('')
        setShake(false)
        busy.current = false
      }, 520)
    }, 180)

    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(resetTimer)
    }
  }, [code, onUnlock])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key >= '0' && event.key <= '9') {
        press(event.key)
      } else if (event.key === 'Backspace') {
        event.preventDefault()
        backspace()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [press, backspace])

  const screenClass = [
    'passcode-screen',
    exiting ? 'is-exiting' : '',
    shake ? 'is-shaking' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={screenClass} aria-label="Passcode">
      <div className="passcode-portrait-wrap">
        <div className="portrait-frame">
          <img
            className="passcode-portrait"
            src="/her-picture.jpg"
            alt="Portrait"
          />
          <svg className="pink-bow" viewBox="0 0 90 78" aria-hidden="true">
            <path
              d="M44 32C34 8 8 6 10 28c2 16 22 14 34 6"
              fill="#e989a6"
            />
            <path
              d="M46 32c10-24 36-26 34-4-2 16-22 14-34 6"
              fill="#f4b4c6"
            />
            <path
              d="M40 34c-8 16-18 28-24 36"
              fill="none"
              stroke="#e989a6"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M50 34c8 18 20 28 28 34"
              fill="none"
              stroke="#f4b4c6"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <ellipse cx="45" cy="33" rx="8" ry="7" fill="#c45b78" />
            <ellipse cx="43" cy="31" rx="3" ry="2" fill="rgba(255,255,255,0.45)" />
          </svg>
        </div>
        <p className="birthday-line">Happy Birthday Sarah</p>
      </div>

      <div className="passcode-panel">
        <p className="passcode-label">Enter Passcode</p>

        <div className="passcode-dots" aria-hidden="true">
          {Array.from({ length: PASSCODE.length }, (_, index) => (
            <span
              key={index}
              className={index < code.length ? 'dot is-filled' : 'dot'}
            />
          ))}
        </div>

        <p className="sr-only" role="status">
          {shake ? 'Incorrect passcode' : ''}
        </p>

        <div className="keypad" role="group" aria-label="Numeric keypad">
          {KEYS.map((key) => (
            <button key={key} type="button" className="key" onClick={() => press(key)}>
              {key}
            </button>
          ))}
          <span className="key key-spacer" aria-hidden="true" />
          <button type="button" className="key" onClick={() => press('0')}>
            0
          </button>
          <button
            type="button"
            className="key key-delete"
            onClick={backspace}
            aria-label="Delete"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
    </section>
  )
}
