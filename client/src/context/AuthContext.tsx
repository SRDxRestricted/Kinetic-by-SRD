import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kinetic_token'))
  const [isLoading, setIsLoading] = useState(true)

  // Set axios default auth header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Verify token on load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setIsLoading(false); return }
      try {
        const res = await axios.get('/api/auth/me')
        setUser(res.data.user)
      } catch {
        setToken(null)
        localStorage.removeItem('kinetic_token')
      } finally {
        setIsLoading(false)
      }
    }
    verifyToken()
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/login', { email, password })
    const { token: newToken, user: newUser } = res.data
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('kinetic_token', newToken)
  }

  const signup = async (name: string, email: string, password: string) => {
    const res = await axios.post('/api/auth/signup', { name, email, password })
    const { token: newToken, user: newUser } = res.data
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('kinetic_token', newToken)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('kinetic_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
