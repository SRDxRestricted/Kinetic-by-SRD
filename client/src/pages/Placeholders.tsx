import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Award, BarChart3, CalendarClock, Check, Crown, Flame, Gauge, History as HistoryIcon,
  Keyboard, LineChart, LogOut, Medal, Play, RotateCcw, Settings as SettingsIcon,
  Shield, SlidersHorizontal, Target, Timer, Trophy, UserRound, Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import styles from './Practice.module.css'

type TestMode = 'time' | 'words' | 'quote' | 'zen'
type ContentType = 'prose' | 'numbers' | 'programming' | 'largeWords' | 'punctuation' | 'mixed' | 'symbols' | 'dates'

interface TestRecord {
  id: string
  mode: TestMode
  wpm: number
  rawWpm: number
  accuracy: number
  consistency: number
  correctChars: number
  incorrectChars: number
  totalChars: number
  duration: number
  timeTaken?: number
  completedAt: string
  text: string
}

interface UserSettings {
  sound: boolean
  highlightErrors: boolean
  caret: 'block' | 'line' | 'underline'
  difficulty: 'easy' | 'medium' | 'hard'
}

const STORAGE_TESTS = 'kinetic_tests'
const STORAGE_SETTINGS = 'kinetic_settings'
const RESULT_EVENT = 'kinetic:last-result'

const defaultSettings: UserSettings = {
  sound: true,
  highlightErrors: true,
  caret: 'line',
  difficulty: 'medium',
}

const passages = [
  'The craft of typing is a conversation between rhythm and attention. Each clean word builds momentum, and each correction teaches the hands to listen. When the sentence stretches across the screen, the mind has room to settle into a steady pace instead of rushing toward the end. A strong test should feel like a lane that keeps opening ahead of you, with enough text to reward consistency, recovery, and calm focus. The best typists do not simply chase speed; they learn to keep their hands relaxed while the timer quietly measures the work.',
  'Great software feels quiet when it works. Behind that calm surface sits a thousand precise decisions, tested by people who care about the small edges. A typing session should have that same feeling: clear text, predictable feedback, and no need to stop early because the paragraph ran out. The goal is to stay inside the flow until the clock expires, letting accuracy and speed emerge from repeated attention. Every mistake is useful information, and every clean phrase gives the next phrase a better chance to land.',
  'Practice is not repetition alone. It is noticing where the mind rushes, slowing down for a moment, and then returning with cleaner speed. Longer passages reveal patterns that short drills hide, because fatigue, focus, and confidence all change after the first few lines. The keyboard becomes less like a collection of keys and more like a familiar map. Keep reading ahead, keep your shoulders loose, and let the timer decide when the test is finished.',
  'A focused session can change the whole shape of a day. Keep your eyes steady, let the keys become familiar, and trust the next character. The passage will continue long enough for timed practice, so there is no need to force the result manually. Instead, use the full window to build rhythm, correct gently, and protect accuracy while speed rises on its own. The most useful score is the one earned across the entire timer, not the one rushed at the beginning.',
  'High performance comes from small choices repeated without drama. Breathe before the first word, read a little ahead, and let each sentence pull the next one forward. If an error happens, avoid the spiral of fixing the feeling instead of fixing the text. Return to the line, rebuild the cadence, and continue. A long timed paragraph gives you space to recover, which makes the final score a better reflection of real typing skill.',
  'The timer is a simple teacher. It does not care about a dramatic start, and it does not reward panic near the end. It only records the shape of the whole attempt. That is why a good typing test needs enough material to last past the clock, especially for one minute or two minute sessions. Keep moving through the paragraph, follow the words as they arrive, and let the test close itself when the time expires.',
]

const contentTypeLabels: Record<ContentType, string> = {
  prose: 'Prose',
  numbers: 'Numbers',
  programming: 'Programming',
  largeWords: 'Large words',
  punctuation: 'Punctuation',
  mixed: 'Mixed',
  symbols: 'Symbols',
  dates: 'Dates',
}

const contentPools: Record<ContentType, string[]> = {
  prose: passages,
  numbers: [
    '483 920 174 650 238 791 506 342 819 075 624 193 857 460 312 789 045 681 237 954 120 368 579 246 813 705 492 168 930 257 641 804',
    '15 30 45 60 75 90 105 120 135 150 165 180 195 210 225 240 255 270 285 300 315 330 345 360 375 390 405 420 435 450',
    '90214 38107 74625 53098 16472 89531 27640 41983 65027 73816 20495 96730 58214 31069 84752 19368 72504 46091 83627 59140',
  ],
  programming: [
    'function calculateWpm(chars, seconds) { const minutes = seconds / 60; const words = chars / 5; return Math.round(words / minutes); } const result = calculateWpm(input.length, elapsed);',
    'type Session = { id: string; mode: "time" | "words"; startedAt: Date; completedAt?: Date; }; const session: Session = { id: crypto.randomUUID(), mode: "time", startedAt: new Date() };',
    'if (user && token) { await api.post("/tests", payload); cache.set("latest-result", payload); } else { localStorage.setItem("latest-result", JSON.stringify(payload)); }',
    'const scores = tests.map(test => test.wpm).filter(Boolean); const best = scores.reduce((max, value) => Math.max(max, value), 0); console.log({ best, count: scores.length });',
  ],
  largeWords: [
    'extraordinary implementation architectural responsibility synchronization characteristic transformation internationalization comprehensibility computationally infrastructure optimization',
    'miscommunication multidisciplinary authorization representational unpredictability observability decentralization configuration interoperability responsiveness',
    'hyperparameterization institutionalization microarchitecture contextualization standardization distinguishability compartmentalization experimentation',
  ],
  punctuation: [
    'Focus, breathe, type: clean words; clean rhythm. Accuracy first, speed second, confidence always. When errors appear, pause, recover, continue.',
    'Ready? Start. Watch the commas, periods, colons, semicolons, quotes, parentheses, and dashes. Every mark belongs exactly where it appears.',
    '"Precision matters," she said. "Not because perfection is required, but because attention compounds." Then the timer reached zero.',
  ],
  mixed: [
    'Sprint 42 begins at 09:30 with build #1847, deploy window 15 min, rollback target 2.5 sec, and accuracy goal 98%.',
    'User alpha_17 typed 86 WPM, missed 4 chars, fixed 2 errors, and improved by 12% over baseline session v3.1.0.',
    'Queue size: 128; latency: 24ms; retry count: 3; status: healthy; next checkpoint: 2026-07-03 22:45.',
  ],
  symbols: [
    '@ # $ % & * + = ? / \\ | ~ ^ _ - : ; < > [ ] { } ( ) @ # $ % & * + = ? / \\ | ~ ^ _ - : ; < > [ ] { } ( )',
    'alpha_beta && gamma_delta || fallback_value !== null ? render(item) : throwError("missing");',
    '<main class="typing-surface"> { speed >= target ? "advance" : "practice" } </main>',
  ],
  dates: [
    '2026-07-03 14:05 2026-07-04 09:30 2026-08-12 18:45 2027-01-01 00:00 03/07/2026 04/07/2026 12/08/2026',
    'Mon 09:15 Tue 10:30 Wed 11:45 Thu 13:00 Fri 16:20 Sat 18:10 Sun 20:40 Q1-2026 Q2-2026 Q3-2026 Q4-2026',
    'Jan 12, 2026 Feb 24, 2026 Mar 08, 2026 Apr 19, 2026 May 30, 2026 Jun 14, 2026 Jul 03, 2026',
  ],
}

const quotePassages = [
  'Simplicity is prerequisite for reliability.',
  'Programs must be written for people to read, and only incidentally for machines to execute.',
  'The details are not the details. They make the design.',
]

function buildTypingText(contentType: ContentType, mode: TestMode) {
  const source = mode === 'quote' ? quotePassages : contentPools[contentType]
  const minimumLength = mode === 'time' ? 2400 : mode === 'zen' ? 1800 : 650
  const pieces: string[] = []
  let index = Math.floor(Math.random() * source.length)

  while (pieces.join(' ').length < minimumLength) {
    pieces.push(source[index % source.length])
    index += 1
  }

  return pieces.join(' ')
}


const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/test', label: 'Test', icon: Keyboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/history', label: 'History', icon: HistoryIcon },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/achievements', label: 'Awards', icon: Award },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

function loadTests(): TestRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_TESTS) || '[]') as TestRecord[]
  } catch {
    return []
  }
}

function normalizeRemoteTest(record: any): TestRecord {
  return {
    id: record.id,
    mode: String(record.mode || 'time').toLowerCase() as TestMode,
    wpm: Math.round(record.wpm || 0),
    rawWpm: Math.round(record.rawWpm || 0),
    accuracy: Math.round(record.accuracy || 0),
    consistency: Math.round(record.consistency || 0),
    correctChars: record.correctChars || 0,
    incorrectChars: record.incorrectChars || 0,
    totalChars: record.totalChars || 0,
    duration: Math.round(record.timeTaken || record.duration || 0),
    timeTaken: record.timeTaken,
    completedAt: record.completedAt,
    text: record.text || '',
  }
}

async function fetchRemoteTests(limit = 100): Promise<TestRecord[]> {
  const res = await axios.get(`/api/tests?limit=${limit}`)
  return (res.data.tests || []).map(normalizeRemoteTest)
}

function saveTests(records: TestRecord[]) {
  localStorage.setItem(STORAGE_TESTS, JSON.stringify(records.slice(0, 100)))
}

async function saveRemoteTest(record: TestRecord, config: { duration?: number | null; wordCount?: number | null }) {
  const payload = {
    mode: record.mode,
    duration: record.mode === 'time' ? config.duration : null,
    wordCount: record.mode === 'words' ? config.wordCount : null,
    difficulty: 'medium',
    language: 'english',
    wpm: record.wpm,
    rawWpm: record.rawWpm,
    accuracy: record.accuracy,
    consistency: record.consistency,
    correctChars: record.correctChars,
    incorrectChars: record.incorrectChars,
    extraChars: 0,
    missedChars: Math.max(0, record.text.length - record.totalChars),
    totalChars: record.totalChars,
    timeTaken: record.duration,
    completedAt: record.completedAt,
  }

  const res = await axios.post('/api/tests', payload)
  return normalizeRemoteTest(res.data.test)
}

function loadSettings(): UserSettings {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(STORAGE_SETTINGS) || '{}') }
  } catch {
    return defaultSettings
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function calculateResult(input: string, target: string, startedAt: number, mode: TestMode): TestRecord {
  const elapsed = Math.max((Date.now() - startedAt) / 1000, 1)
  let correctChars = 0
  let incorrectChars = 0

  input.split('').forEach((char, index) => {
    if (char === target[index]) correctChars += 1
    else incorrectChars += 1
  })

  const totalChars = Math.max(input.length, 1)
  const minutes = elapsed / 60
  const rawWpm = Math.round((input.length / 5) / minutes)
  const netWpm = Math.max(0, Math.round(((correctChars - incorrectChars) / 5) / minutes))
  const accuracy = Math.round((correctChars / totalChars) * 100)
  const consistency = Math.max(40, Math.min(100, Math.round(accuracy - Math.min(20, incorrectChars * 2) + Math.min(10, netWpm / 18))))

  return {
    id: crypto.randomUUID(),
    mode,
    wpm: netWpm,
    rawWpm,
    accuracy,
    consistency,
    correctChars,
    incorrectChars,
    totalChars: input.length,
    duration: Math.round(elapsed),
    completedAt: new Date().toISOString(),
    text: target,
  }
}

function best(records: TestRecord[], key: keyof Pick<TestRecord, 'wpm' | 'accuracy' | 'consistency'>) {
  return records.reduce((max, record) => Math.max(max, record[key]), 0)
}

function average(records: TestRecord[], key: keyof Pick<TestRecord, 'wpm' | 'accuracy' | 'consistency'>) {
  if (!records.length) return 0
  return Math.round(records.reduce((sum, record) => sum + record[key], 0) / records.length)
}

function getStreak(records: TestRecord[]) {
  const days = new Set(records.map(record => record.completedAt.slice(0, 10)))
  let streak = 0
  const cursor = new Date()
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function Shell({ title, subtitle, children, minimalHeader }: { title: string; subtitle: string; children: React.ReactNode; minimalHeader?: boolean }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <button className={styles.brand} onClick={() => navigate('/dashboard')} aria-label="Kinetic dashboard">
          <Keyboard size={24} />
          <span>Kinetic</span>
        </button>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button className={styles.logout} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <div className={styles.main}>
        <header className={`${styles.topbar} ${minimalHeader ? styles.minimalTopbar : ''}`}>
          {!minimalHeader ? (
            <div>
              <p className={styles.eyebrow}>Kinetic typing lab</p>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          ) : (
            <div style={{ flex: 1 }}></div>
          )}
          <div className={styles.userPill}>
            <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase() || 'K'}</div>
            <div>
              <strong>{user?.name || 'Typist'}</strong>
              <span>{user?.email || 'local session'}</span>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}

function MetricCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: React.ElementType }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon}><Icon size={20} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  )
}

function EmptyState({ title, action }: { title: string; action?: string }) {
  return (
    <div className={styles.emptyState}>
      <Keyboard size={32} />
      <strong>{title}</strong>
      {action && <span>{action}</span>}
    </div>
  )
}

export function Dashboard() {
  const [records, setRecords] = useState<TestRecord[]>(() => loadTests())
  const latest = records[0]
  const navigate = useNavigate()

  useEffect(() => {
    fetchRemoteTests().then((remote) => {
      setRecords(remote)
      saveTests(remote)
    }).catch(() => undefined)
  }, [])

  return (
    <Shell title="Dashboard" subtitle="Your practice cockpit, personal bests, and next session.">
      <section className={styles.metricsGrid}>
        <MetricCard label="Best WPM" value={`${best(records, 'wpm')}`} hint="highest completed test" icon={Zap} />
        <MetricCard label="Average accuracy" value={`${average(records, 'accuracy')}%`} hint="across saved sessions" icon={Target} />
        <MetricCard label="Practice streak" value={`${getStreak(records)}d`} hint="days with a completed test" icon={Flame} />
        <MetricCard label="Tests completed" value={`${records.length}`} hint="stored locally for now" icon={Check} />
      </section>

      <section className={styles.twoColumn}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Start a session</h2>
              <p>Jump into timed, word count, quote, or zen practice.</p>
            </div>
            <button className={styles.primaryBtn} onClick={() => navigate('/test')}><Play size={18} /> Start</button>
          </div>
          <div className={styles.sessionPreview}>
            <span>The next clean repetition is where speed starts to stick.</span>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Latest result</h2>
              <p>{latest ? formatDate(latest.completedAt) : 'No saved sessions yet'}</p>
            </div>
          </div>
          {latest ? (
            <div className={styles.resultStrip}>
              <strong>{latest.wpm}<span>wpm</span></strong>
              <strong>{latest.accuracy}<span>% acc</span></strong>
              <strong>{latest.consistency}<span>% consistency</span></strong>
            </div>
          ) : <EmptyState title="No result yet" action="Complete your first typing test." />}
        </div>
      </section>
    </Shell>
  )
}

export function TypingTest() {
  const [mode, setMode] = useState<TestMode>('time')
  const [contentType, setContentType] = useState<ContentType>('prose')
  const [duration, setDuration] = useState(60)
  const [target, setTarget] = useState(() => buildTypingText('prose', 'time'))
  const [input, setInput] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [result, setResult] = useState<TestRecord | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const inputValueRef = useRef(input)
  const targetRef = useRef(target)
  const startedAtRef = useRef(startedAt)
  const resultRef = useRef(result)
  const modeRef = useRef(mode)
  const contentTypeRef = useRef(contentType)
  const navigate = useNavigate()

  const progress = Math.min(100, Math.round((input.length / target.length) * 100))
  const isRunning = startedAt !== null && !result

  useEffect(() => {
    inputValueRef.current = input
    targetRef.current = target
    startedAtRef.current = startedAt
    resultRef.current = result
    modeRef.current = mode
    contentTypeRef.current = contentType
  }, [input, target, startedAt, result, mode, contentType])

  useEffect(() => {
    // Focus the typing input on mount without scrolling the page
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (!isRunning || mode !== 'time') return undefined
    const timerId = window.setInterval(() => {
      setTimeLeft(value => {
        if (value <= 1) {
          void finish()
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timerId)
  }, [isRunning, mode])

  const pickText = (nextMode = mode, nextContentType = contentType) => {
    return buildTypingText(nextContentType, nextMode)
  }

  const reset = (nextMode = mode, nextContentType = contentType) => {
    setInput('')
    inputValueRef.current = ''
    setStartedAt(null)
    startedAtRef.current = null
    setResult(null)
    resultRef.current = null
    setTimeLeft(duration)
    const nextTarget = pickText(nextMode, nextContentType)
    setTarget(nextTarget)
    targetRef.current = nextTarget
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0)
  }

  const finish = async (typedValue = inputValueRef.current) => {
    const startTime = startedAtRef.current
    const activeTarget = targetRef.current
    const activeMode = modeRef.current

    if (!startTime || resultRef.current) return

    const completed = calculateResult(typedValue, activeTarget, startTime, activeMode)
    resultRef.current = completed
    const records = [completed, ...loadTests()]
    saveTests(records)
    localStorage.setItem(RESULT_EVENT, JSON.stringify(completed))
    setResult(completed)
    try {
      const remote = await saveRemoteTest(completed, { duration, wordCount: activeTarget.split(' ').length })
      localStorage.setItem(RESULT_EVENT, JSON.stringify(remote))
      saveTests([remote, ...loadTests().filter(record => record.id !== completed.id)])
      resultRef.current = remote
      setResult(remote)
      toast.success('Test saved to your account')
    } catch {
      toast.success('Test saved locally')
    }
  }

  const handleInput = (value: string) => {
    if (resultRef.current) return
    const now = Date.now()
    if (!startedAtRef.current) {
      setStartedAt(now)
      startedAtRef.current = now
    }
    if (value.length > target.length && mode !== 'zen') return
    inputValueRef.current = value
    setInput(value)
    if ((mode === 'words' || mode === 'quote') && value.length >= target.length) {
      window.setTimeout(() => void finish(value), 0)
    }
  }

  const setTestMode = (nextMode: TestMode) => {
    setMode(nextMode)
    modeRef.current = nextMode
    reset(nextMode, contentTypeRef.current)
  }

  const setTextType = (nextContentType: ContentType) => {
    setContentType(nextContentType)
    contentTypeRef.current = nextContentType
    reset(modeRef.current, nextContentType)
  }

  const chars = target.split('').map((char, index) => {
    let className = styles.pendingChar
    if (input[index] === char) className = styles.correctChar
    else if (input[index]) className = styles.errorChar
    if (index === input.length) className += ` ${styles.activeChar}`
    return <span key={`${char}-${index}`} className={className}>{char}</span>
  })

  return (
    <Shell title="Typing Test" subtitle="A focused typing surface with live feedback and saved results." minimalHeader>
      <section className={styles.testPanel}>
        <div className={styles.testToolbar}>
          <div className={styles.segmented}>
            {(['time', 'words', 'quote', 'zen'] as TestMode[]).map(option => (
              <button key={option} className={mode === option ? styles.segmentActive : ''} onClick={() => setTestMode(option)}>{option}</button>
            ))}
          </div>
          <div className={styles.testActions}>
            <select value={contentType} onChange={event => setTextType(event.target.value as ContentType)} className={styles.select} disabled={mode === 'quote'}>
              {(Object.keys(contentTypeLabels) as ContentType[]).map(value => <option key={value} value={value}>{contentTypeLabels[value]}</option>)}
            </select>
            <select value={duration} onChange={event => { setDuration(Number(event.target.value)); setTimeLeft(Number(event.target.value)) }} className={styles.select}>
              {[15, 30, 60, 120].map(value => <option key={value} value={value}>{value}s</option>)}
            </select>
            <button className={styles.iconBtn} onClick={() => reset()} aria-label="Reset test"><RotateCcw size={18} /></button>
          </div>
        </div>

        <div className={styles.compactStats}>
          <div className={styles.compactStat}>
            <Timer size={16} /> <span>{mode === 'time' ? `${timeLeft}s` : `${result?.duration || 0}s`}</span>
          </div>
          <div className={styles.compactStat}>
            <LineChart size={16} /> <span>{progress}%</span>
          </div>
          <div className={styles.compactStat}>
            <SlidersHorizontal size={16} /> <span>{mode}</span>
          </div>
        </div>

        <div className={styles.typingSurface} onClick={() => inputRef.current?.focus({ preventScroll: true })}>
          <div className={styles.typingText}>{chars}</div>
        </div>

        <div className={styles.testFooter}>
          <button className={styles.secondaryBtn} onClick={() => reset()}><RotateCcw size={18} /> New text</button>
          {mode === 'time' ? (
            <span className={styles.autoEndNote}>Timed tests save automatically when the clock reaches zero.</span>
          ) : (
            <button className={styles.primaryBtn} onClick={() => void finish()} disabled={!startedAt || Boolean(result)}><Check size={18} /> Finish</button>
          )}
        </div>
      </section>

      <textarea
        ref={inputRef}
        value={input}
        onChange={event => handleInput(event.target.value)}
        disabled={Boolean(result)}
        className={styles.hiddenInput}
        spellCheck={false}
        aria-label="Typing input"
      />

      {result && (
        <section className={styles.resultPanel}>
          <MetricCard label="WPM" value={`${result.wpm}`} hint={`${result.rawWpm} raw`} icon={Zap} />
          <MetricCard label="Accuracy" value={`${result.accuracy}%`} hint={`${result.incorrectChars} errors`} icon={Target} />
          <MetricCard label="Consistency" value={`${result.consistency}%`} hint="rhythm score" icon={Gauge} />
          <button className={styles.primaryBtn} onClick={() => navigate('/results')}>Open results</button>
        </section>
      )}
    </Shell>
  )
}

export function TestResults() {
  const result = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(RESULT_EVENT) || 'null') as TestRecord | null
    } catch {
      return null
    }
  }, [])

  return (
    <Shell title="Test Results" subtitle="A close look at your most recent completed session.">
      {result ? (
        <>
          <section className={styles.metricsGrid}>
            <MetricCard label="Net WPM" value={`${result.wpm}`} hint={`${result.rawWpm} raw WPM`} icon={Zap} />
            <MetricCard label="Accuracy" value={`${result.accuracy}%`} hint={`${result.correctChars} correct chars`} icon={Target} />
            <MetricCard label="Consistency" value={`${result.consistency}%`} hint="pace quality estimate" icon={Gauge} />
            <MetricCard label="Duration" value={`${result.duration}s`} hint={formatDate(result.completedAt)} icon={Timer} />
          </section>
          <section className={styles.panel}>
            <h2>Character breakdown</h2>
            <div className={styles.breakdown}>
              <span style={{ width: `${Math.max(1, result.correctChars)}%` }}>Correct {result.correctChars}</span>
              <span style={{ width: `${Math.max(1, result.incorrectChars)}%` }}>Errors {result.incorrectChars}</span>
            </div>
          </section>
        </>
      ) : <EmptyState title="No recent result" action="Finish a typing test to see this screen." />}
    </Shell>
  )
}

export function Analytics() {
  const [records, setRecords] = useState<TestRecord[]>(() => loadTests())
  const recent = records.slice(0, 10).reverse()

  useEffect(() => {
    fetchRemoteTests().then((remote) => {
      setRecords(remote)
      saveTests(remote)
    }).catch(() => undefined)
  }, [])

  return (
    <Shell title="Analytics" subtitle="Speed, accuracy, and consistency trends from local practice data.">
      <section className={styles.metricsGrid}>
        <MetricCard label="Best WPM" value={`${best(records, 'wpm')}`} hint="personal peak" icon={Zap} />
        <MetricCard label="Average WPM" value={`${average(records, 'wpm')}`} hint="all sessions" icon={BarChart3} />
        <MetricCard label="Average accuracy" value={`${average(records, 'accuracy')}%`} hint="all sessions" icon={Target} />
        <MetricCard label="Consistency" value={`${average(records, 'consistency')}%`} hint="all sessions" icon={Gauge} />
      </section>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Last 10 sessions</h2>
            <p>Bars compare WPM and accuracy for recent work.</p>
          </div>
        </div>
        {recent.length ? (
          <div className={styles.chart}>
            {recent.map(record => (
              <div key={record.id} className={styles.chartColumn}>
                <div className={styles.barWrap}>
                  <span className={styles.wpmBar} style={{ height: `${Math.min(100, record.wpm)}%` }} />
                  <span className={styles.accBar} style={{ height: `${record.accuracy}%` }} />
                </div>
                <small>{record.wpm}</small>
              </div>
            ))}
          </div>
        ) : <EmptyState title="No chart data yet" action="Run a few sessions to create a trend." />}
      </section>
    </Shell>
  )
}

export function History() {
  const [records, setRecords] = useState<TestRecord[]>(() => loadTests())

  useEffect(() => {
    fetchRemoteTests().then((remote) => {
      setRecords(remote)
      saveTests(remote)
    }).catch(() => undefined)
  }, [])

  const clearHistory = () => {
    saveTests([])
    setRecords([])
    toast.success('History cleared')
  }

  return (
    <Shell title="History" subtitle="A chronological log of every completed local session.">
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Sessions</h2>
            <p>{records.length} saved results</p>
          </div>
          <button className={styles.secondaryBtn} onClick={clearHistory}>Clear</button>
        </div>
        {records.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Date</th><th>Mode</th><th>WPM</th><th>Accuracy</th><th>Consistency</th></tr></thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id}>
                    <td>{formatDate(record.completedAt)}</td>
                    <td>{record.mode}</td>
                    <td>{record.wpm}</td>
                    <td>{record.accuracy}%</td>
                    <td>{record.consistency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No sessions yet" action="Your completed typing tests will appear here." />}
      </section>
    </Shell>
  )
}

export function Leaderboard() {
  const [records, setRecords] = useState<TestRecord[]>(() => loadTests())
  const localBest = best(records, 'wpm')
  const [remoteLeaders, setRemoteLeaders] = useState<Array<{ rank: number; user: { name: string }; wpm: number; accuracy: number }>>([])

  useEffect(() => {
    fetchRemoteTests().then((remote) => {
      setRecords(remote)
      saveTests(remote)
    }).catch(() => undefined)
    axios.get('/api/stats/leaderboard?limit=25').then((res) => setRemoteLeaders(res.data.leaders || [])).catch(() => undefined)
  }, [])

  const leaders = remoteLeaders.length ? remoteLeaders.map((leader) => [
    leader.user.name,
    leader.wpm,
    `${Math.round(leader.accuracy)}%`,
  ]) : [
    ['HyperSonic', 218, '99.8%'],
    ['GhostTypist', 205, '100%'],
    ['LatencyZero', 198, '99.2%'],
    ['StackSprinter', 181, '98.9%'],
    ['You', localBest, `${best(records, 'accuracy')}%`],
  ].filter(row => Number(row[1]) > 0)

  return (
    <Shell title="Leaderboard" subtitle="A polished leaderboard shell ready for live rankings.">
      <section className={styles.panel}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Rank</th><th>Typist</th><th>WPM</th><th>Accuracy</th></tr></thead>
            <tbody>
              {leaders.map(([name, wpm, accuracy], index) => (
                <tr key={name}>
                  <td>#{index + 1}</td>
                  <td className={styles.nameCell}>{index < 3 ? <Crown size={16} /> : <Medal size={16} />}{name}</td>
                  <td>{wpm}</td>
                  <td>{accuracy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  )
}

export function Profile() {
  const { user } = useAuth()
  const [records, setRecords] = useState<TestRecord[]>(() => loadTests())

  useEffect(() => {
    fetchRemoteTests().then((remote) => {
      setRecords(remote)
      saveTests(remote)
    }).catch(() => undefined)
  }, [])

  return (
    <Shell title="Profile" subtitle="Your identity, totals, and best saved typing marks.">
      <section className={styles.profileHero}>
        <div className={styles.bigAvatar}>{user?.name?.charAt(0).toUpperCase() || 'K'}</div>
        <div>
          <h2>{user?.name || 'Kinetic Typist'}</h2>
          <p>{user?.email || 'No email available'}</p>
        </div>
      </section>
      <section className={styles.metricsGrid}>
        <MetricCard label="Tests" value={`${records.length}`} hint="local completions" icon={Keyboard} />
        <MetricCard label="Best WPM" value={`${best(records, 'wpm')}`} hint="personal best" icon={Trophy} />
        <MetricCard label="Best accuracy" value={`${best(records, 'accuracy')}%`} hint="cleanest run" icon={Shield} />
        <MetricCard label="Streak" value={`${getStreak(records)}d`} hint="daily practice" icon={Flame} />
      </section>
    </Shell>
  )
}

export function Settings() {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings())

  const update = (next: UserSettings) => {
    setSettings(next)
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(next))
  }

  return (
    <Shell title="Settings" subtitle="Tune the local practice experience to match how you train.">
      <section className={styles.panel}>
        <div className={styles.settingRow}>
          <div><h2>Sound feedback</h2><p>Subtle completion and error cues.</p></div>
          <input type="checkbox" checked={settings.sound} onChange={event => update({ ...settings, sound: event.target.checked })} />
        </div>
        <div className={styles.settingRow}>
          <div><h2>Highlight errors</h2><p>Mark incorrect characters while typing.</p></div>
          <input type="checkbox" checked={settings.highlightErrors} onChange={event => update({ ...settings, highlightErrors: event.target.checked })} />
        </div>
        <div className={styles.settingRow}>
          <div><h2>Caret style</h2><p>Choose the visual rhythm marker.</p></div>
          <select className={styles.select} value={settings.caret} onChange={event => update({ ...settings, caret: event.target.value as UserSettings['caret'] })}>
            <option value="line">Line</option>
            <option value="block">Block</option>
            <option value="underline">Underline</option>
          </select>
        </div>
        <div className={styles.settingRow}>
          <div><h2>Default difficulty</h2><p>Controls the suggested word complexity.</p></div>
          <select className={styles.select} value={settings.difficulty} onChange={event => update({ ...settings, difficulty: event.target.value as UserSettings['difficulty'] })}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </section>
    </Shell>
  )
}

export function Achievements() {
  const [records, setRecords] = useState<TestRecord[]>(() => loadTests())

  useEffect(() => {
    fetchRemoteTests().then((remote) => {
      setRecords(remote)
      saveTests(remote)
    }).catch(() => undefined)
  }, [])
  const achievements = [
    { title: 'First Flight', desc: 'Complete your first test.', unlocked: records.length >= 1, icon: Play },
    { title: 'Clean Hands', desc: 'Reach 95% accuracy.', unlocked: best(records, 'accuracy') >= 95, icon: Target },
    { title: 'Fast Lane', desc: 'Reach 80 WPM.', unlocked: best(records, 'wpm') >= 80, icon: Zap },
    { title: 'Century Mark', desc: 'Reach 100 WPM.', unlocked: best(records, 'wpm') >= 100, icon: Trophy },
    { title: 'Consistent', desc: 'Reach 90% consistency.', unlocked: best(records, 'consistency') >= 90, icon: Gauge },
    { title: 'Ten Pack', desc: 'Complete 10 tests.', unlocked: records.length >= 10, icon: CalendarClock },
  ]

  return (
    <Shell title="Achievements" subtitle="Milestones that make practice feel visible.">
      <section className={styles.achievementGrid}>
        {achievements.map(item => (
          <div key={item.title} className={`${styles.achievementCard} ${item.unlocked ? styles.unlocked : ''}`}>
            <item.icon size={24} />
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
            <span>{item.unlocked ? 'Unlocked' : 'Locked'}</span>
          </div>
        ))}
      </section>
    </Shell>
  )
}
