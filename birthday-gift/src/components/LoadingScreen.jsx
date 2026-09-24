import { BIRTH_DATE } from '../config.js'

export default function LoadingScreen({ exiting = false }) {
  return (
    <section className={`loading-screen${exiting ? ' is-exiting' : ''}`} aria-label="Loading">
      <p className="loading-date">{BIRTH_DATE}</p>
      <svg className="loading-heart" viewBox="0 0 100 90" aria-hidden="true">
        <path
          d="M50 82C50 82 10 56 10 34C10 18 22 8 34 8C42 8 47 13 50 20C53 13 58 8 66 8C78 8 90 18 90 34C90 56 50 82 50 82Z"
          pathLength="100"
        />
      </svg>
    </section>
  )
}
