import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import styles from './Auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className="grain-overlay" />
      <div className={styles.orbBlue} />
      <div className={styles.orbOrange} />

      <main className={styles.main}>
        <div className={styles.grid}>
          {/* Left illustration */}
          <div className={styles.illustration}>
            <div className={styles.illustrationInner}>
              <div className={styles.illustrationOverlay}>
                <h1 className={styles.illustrationTitle}>Focus on Flow.</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', maxWidth: 380, fontSize: 15 }}>
                  Precision typing analytics and high-performance training for the modern developer.
                </p>
              </div>
            </div>
          </div>

          {/* Login card */}
          <div className={styles.cardWrap}>
            <div className={`glass-card ${styles.card}`}>
              <div className={styles.cardHeader}>
                <div className={styles.brandRow}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 32 }}>keyboard</span>
                  <span className={styles.brandName}>Kinetic</span>
                </div>
                <h2 className={styles.cardTitle}>Welcome back</h2>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 15 }}>Enter your details to access your dashboard.</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <input id="email" type="email" placeholder="name@company.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className={`${styles.input} input-focus-ring`} />
                </div>
                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label htmlFor="password" className={styles.label}>Password</label>
                    <a href="#" className={styles.forgotLink}>Forgot Password?</a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className={`${styles.input} input-focus-ring`} style={{ paddingRight: 48 }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className={styles.eyeBtn}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input id="remember" type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }} />
                  <label htmlFor="remember" style={{ color: 'var(--color-on-surface-variant)', fontSize: 15, userSelect: 'none' }}>Remember me</label>
                </div>

                <div className={styles.actions}>
                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                  <div className={styles.divider}>
                    <div className={styles.dividerLine} />
                    <span className={styles.dividerText}>Or continue with</span>
                    <div className={styles.dividerLine} />
                  </div>
                  <button type="button" className={styles.googleBtn}>
                    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C34 32.7 29.5 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3L37 9.1C33.5 5.8 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7 13.7 20c2-5.5 7.2-9.5 13.3-9.5 3.1 0 5.8 1.1 7.9 3L37 9.1C33.5 5.8 29 4 24 4 15.8 4 8.8 9.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c4.8 0 9.3-1.8 12.7-4.7l-5.9-5c-2.1 1.4-4.7 2.2-6.8 2.2-5.4 0-10-3.3-11.8-8L6.1 34c2.8 5.9 8.9 10 17.9 10z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.5-2.5 4.7-4.8 6.2l5.9 5C41 37.3 44 31 44 24c0-1.2-.1-2.4-.4-3.5z" /></svg>
                    <span style={{ fontWeight: 500, color: 'var(--color-on-surface)' }}>Continue with Google</span>
                  </button>
                </div>
              </form>

              <div className={styles.switchLink}>
                <p style={{ color: 'var(--color-on-surface-variant)' }}>
                  Don't have an account?{' '}
                  <Link to="/signup" className={styles.link}>Sign Up</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Kinetic Typing. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
            <a key={l} href="#" className={styles.footerLink}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
