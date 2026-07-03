import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SplashScreen.module.css'

const STATUSES = [
  'Initializing precision engine',
  'Warming up mechanical switches',
  'Synthesizing focus layers',
  'Synchronizing leaderboard data',
  'Ready for high-performance',
]

export default function SplashScreen() {
  const navigate = useNavigate()
  const circleRef = useRef<SVGCircleElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const circle = circleRef.current
    const text = textRef.current
    const status = statusRef.current
    if (!circle || !text || !status) return

    const radius = 44
    const circumference = radius * 2 * Math.PI
    circle.style.strokeDasharray = `${circumference}`
    circle.style.strokeDashoffset = `${circumference}`

    const duration = 3500
    const start = Date.now()

    const update = () => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / duration) * 100, 100)
      const offset = circumference - (pct / 100) * circumference
      circle.style.strokeDashoffset = `${offset}`
      text.textContent = `${Math.round(pct)}%`

      const idx = Math.min(Math.floor((pct / 101) * STATUSES.length), STATUSES.length - 1)
      status.textContent = STATUSES[idx]

      if (pct < 100) {
        requestAnimationFrame(update)
      } else {
        status.textContent = 'Access Granted'
        status.style.color = 'var(--color-tertiary)'
        circle.style.stroke = 'var(--color-tertiary)'
        setTimeout(() => navigate('/'), 600)
      }
    }

    requestAnimationFrame(update)

    setTimeout(() => {
      if (footerRef.current) {
        footerRef.current.style.opacity = '1'
      }
    }, 1200)
  }, [navigate])

  return (
    <div className={styles.wrapper}>
      <div className="grain-overlay" />

      {/* Atmospheric orbs */}
      <div className={styles.orbBlue} />
      <div className={styles.orbOrange} />

      <main className={styles.main}>
        {/* Keyboard SVG */}
        <div className={styles.keyboardWrap}>
          <svg className={styles.keyboardSvg} fill="none" viewBox="0 0 200 100">
            <rect className={styles.kbPath} style={{ stroke: 'var(--color-primary)' }}
              height="70" rx="8" strokeWidth="1.5" width="180" x="10" y="20" />
            <path className={styles.kbPath} style={{ stroke: 'var(--color-outline)' }}
              d="M30 40H50M65 40H85M100 40H120M135 40H155M170 40H175"
              strokeLinecap="round" strokeWidth="1.5" />
            <path className={styles.kbPath} style={{ stroke: 'var(--color-outline)' }}
              d="M25 60H45M60 60H80M95 60H140M155 60H175"
              strokeLinecap="round" strokeWidth="1.5" />
          </svg>
          {/* Floating letters */}
          <div className={styles.kineticText}>
            {'KINETIC'.split('').map((ch, i) => (
              <span key={i} style={{ animationDelay: `${0.1 + i * 0.1}s` }}>{ch}</span>
            ))}
          </div>
        </div>

        {/* Progress ring */}
        <div className={styles.ringWrap}>
          <svg width="96" height="96">
            <circle cx="48" cy="48" r="44" fill="transparent"
              stroke="var(--color-surface-container-highest)" strokeWidth="2" />
            <circle ref={circleRef} cx="48" cy="48" r="44" fill="transparent"
              stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.2s' }} />
          </svg>
          <div className={styles.ringText}>
            <span ref={textRef} style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface)', fontSize: 14 }}>0%</span>
          </div>
        </div>

        {/* Status */}
        <div style={{ textAlign: 'center' }}>
          <p ref={statusRef} className={styles.status}>Calibrating Flow State</p>
          <div className={styles.dots}>
            {[0, 0.2, 0.4].map((d, i) => (
              <span key={i} className={styles.dot} style={{ animationDelay: `${d}s` }} />
            ))}
          </div>
        </div>
      </main>

      <footer ref={footerRef} className={styles.footer}>
        <span className="material-symbols-outlined" style={{ color: 'rgba(140,144,159,0.3)', fontSize: 20 }}>format_quote</span>
        <p style={{ color: 'var(--color-on-surface-variant)', fontStyle: 'italic', fontSize: 14 }}>
          "The only way to do great work is to love what you do, and type it really, really fast."
        </p>
        <p style={{ color: 'var(--color-outline)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em' }}>— Kinetic Core</p>
      </footer>
    </div>
  )
}
