import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Landing.module.css'

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active') }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.page}>
      <div className="grain-overlay" />

      {/* Nav */}
      <header className={styles.nav}>
        <nav className={styles.navInner}>
          <div className={styles.logo}>Kinetic</div>
          <div className={styles.navLinks}>
            <a href="#" className={styles.navLinkActive}>Home</a>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#leaderboard" className={styles.navLink}>Leaderboard</a>
          </div>
          <div className={styles.navActions}>
            <button onClick={() => navigate('/login')} className={styles.btnGhost}>Login</button>
            <button onClick={() => navigate('/signup')} className={styles.btnPrimary}>Sign Up</button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroContent}>
            <div className={`${styles.badge} reveal`} id="hero-badge">
              <span className={styles.badgeDot} />
              <span className={styles.badgeText}>V2.0 NOW LIVE</span>
            </div>
            <h1 className={`${styles.heroTitle} reveal`}>
              Improve Your <span style={{ color: 'var(--color-primary)' }}>Typing Speed.</span>
            </h1>
            <p className={`${styles.heroSub} reveal`}>
              Master the art of precision and velocity with the world's most sophisticated typing engine.
              Designed for developers and high-performance individuals.
            </p>
            <div className={`${styles.heroCta} reveal`}>
              <button onClick={() => navigate('/test')} className={styles.ctaPrimary}>
                <span>Start Typing</span>
                <div className={styles.ctaSheen} />
              </button>
              <button onClick={() => navigate('/leaderboard')} className={styles.ctaOutline}>
                View Leaderboard
              </button>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className={`${styles.dashPreview} reveal`}>
            <div className="glass-card" style={{ borderRadius: 16, padding: '24px 32px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className={styles.previewHeader}>
                <div className={styles.trafficLights}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,100,100,0.4)' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,183,134,0.4)' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(173,198,255,0.4)' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '2px 12px', borderRadius: 4, background: 'rgba(173,198,255,0.1)', color: 'var(--color-primary)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>TIMED 60S</span>
                  <span style={{ padding: '2px 12px', borderRadius: 4, background: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface-variant)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>ENGLISH</span>
                </div>
              </div>
              <div className={styles.previewText}>
                The <span style={{ color: 'var(--color-on-surface)' }}>quick</span> brown fox jumps over the lazy dog. Programming is the art of{' '}
                <span style={{ borderBottom: '2px solid var(--color-primary)', color: 'var(--color-on-surface)' }}>telling another human</span>{' '}
                being what one wants the computer to do...
              </div>
              <div className={styles.previewStats}>
                <div className={styles.stat}><div className={styles.statLabel}>WPM</div><div className={styles.statVal}>124</div></div>
                <div className={styles.stat}><div className={styles.statLabel}>ACC</div><div className={styles.statVal}>98%</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className={styles.section}>
          <div className={styles.featureGrid}>
            {[
              { icon: 'bolt', color: 'var(--color-primary)', bg: 'rgba(173,198,255,0.1)', title: 'Elite Speed', desc: 'Latency-free engine designed for maximum raw speed tracking.', link: 'Explore analytics →' },
              { icon: 'target', color: 'var(--color-tertiary)', bg: 'rgba(255,183,134,0.1)', title: 'Precision Mapping', desc: 'Detailed heatmaps showing exactly which keys are slowing you down.', link: 'View heatmaps →' },
              { icon: 'analytics', color: 'var(--color-primary-container)', bg: 'rgba(77,142,255,0.1)', title: 'Progression Track', desc: 'Watch your improvement over months with elegant data visualizations.', link: 'Personal history →' },
            ].map((f, i) => (
              <div key={i} className={`${styles.featureCard} glass-card reveal`}>
                <div>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 16 }}>
                    <span className="material-symbols-outlined">{f.icon}</span>
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 8, color: 'var(--color-on-surface)' }}>{f.title}</h3>
                  <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 15 }}>{f.desc}</p>
                </div>
                <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid rgba(66,71,84,0.3)', color: 'var(--color-outline)', fontSize: 14 }}>{f.link}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className={styles.section}>
          <div className={`glass-card ${styles.statsCard} reveal`} style={{ borderColor: 'rgba(173,198,255,0.2)' }}>
            <div className={styles.statsOrb} />
            <div className={styles.statsText}>
              <h2 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
                Trusted by 50,000+<br /><span style={{ color: 'var(--color-primary)' }}>Performance Junkies.</span>
              </h2>
              <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: 24 }}>
                Whether you're a developer optimizing your workflow or a competitive typist, Kinetic provides the tools to break through plateaus.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {[['2.4M', 'TESTS TAKEN'], ['88 WPM', 'AVG SPEED']].map(([val, lbl]) => (
                  <div key={lbl}>
                    <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-on-surface)' }}>{val}</div>
                    <div style={{ fontSize: 12, letterSpacing: '0.1em', color: 'var(--color-outline)', textTransform: 'uppercase', fontWeight: 600 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.statsImg}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top right, rgba(173,198,255,0.2), transparent)', borderRadius: '50%', animation: 'pulse 3s ease-in-out infinite' }} />
              <div style={{ width: '100%', height: '100%', borderRadius: 16, background: 'linear-gradient(135deg, var(--color-surface-container) 0%, var(--color-surface-container-high) 100%)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontSize: 64 }}>
                ⌨️
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section id="leaderboard" className={styles.section}>
          <div style={{ textAlign: 'center', marginBottom: 32 }} className="reveal">
            <h2 style={{ fontWeight: 600, fontSize: 24, marginBottom: 8 }}>Global Leaderboard</h2>
            <p style={{ color: 'var(--color-on-surface-variant)' }}>The fastest fingers in the world.</p>
          </div>
          <div className={`glass-card ${styles.leaderTable} reveal`}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(66,71,84,0.2)', fontSize: 12, letterSpacing: '0.1em', color: 'var(--color-outline)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {['Rank', 'User', 'WPM', 'Accuracy'].map(h => <th key={h} style={{ padding: '16px 24px', textAlign: 'left' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[['HyperSonic', '218', '99.8%'], ['GhostTypist', '205', '100%'], ['LatencyZero', '198', '99.2%']].map(([name, wpm, acc], i) => (
                  <tr key={name} style={{ borderBottom: i < 2 ? '1px solid rgba(66,71,84,0.1)' : 'none', color: 'var(--color-on-surface-variant)' }}>
                    <td style={{ padding: '16px 24px', color: 'var(--color-primary)' }}>#{i + 1}</td>
                    <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-surface-container-highest)' }} />
                      <span style={{ color: 'var(--color-on-surface)', fontWeight: 500 }}>{name}</span>
                    </td>
                    <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)' }}>{wpm}</td>
                    <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)' }}>{acc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }} className="reveal">
            <a onClick={() => navigate('/leaderboard')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>View full leaderboard →</a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 4 }}>Kinetic</div>
            <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', letterSpacing: '0.05em' }}>© 2024 Kinetic Typing. All rights reserved.</div>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {['Privacy', 'Terms', 'Github', 'Contact'].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', fontWeight: 600 }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
