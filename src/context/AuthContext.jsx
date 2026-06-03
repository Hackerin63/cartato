import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

const Ctx = createContext(null)

const BASE = '/api'

// ── Raw fetch wrapper ─────────────────────────────────────────────────────────
export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('cartato_token')
  const res = await fetch(BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
    ...opts,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.message || 'Request failed'), { status: res.status, data })
  return data
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  const rehydrate = useCallback(async () => {
    const token = localStorage.getItem('cartato_token')
    if (!token) { setLoading(false); return }
    try {
      const d = await apiFetch('/auth/me')
      setUser(d.user)
    } catch {
      localStorage.removeItem('cartato_token')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { rehydrate() }, [rehydrate])

  const login = async (email, password) => {
    try {
      const d = await apiFetch('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem('cartato_token', d.token)
      setUser(d.user)
      toast.success(`Welcome back, ${d.user.name.split(' ')[0]}!`)
      return { ok: true }
    } catch (e) { toast.error(e.message || 'Login failed'); return { ok: false } }
  }

  const register = async (name, email, password) => {
    try {
      const d = await apiFetch('/auth/register', { method:'POST', body: JSON.stringify({ name, email, password }) })
      localStorage.setItem('cartato_token', d.token)
      setUser(d.user)
      toast.success('Account created! Welcome to cartato.')
      return { ok: true }
    } catch (e) { toast.error(e.message || 'Registration failed'); return { ok: false } }
  }

  const logout = () => {
    localStorage.removeItem('cartato_token')
    setUser(null)
    toast('Signed out', { icon: '👋' })
  }

  const updateProfile = async (body) => {
    try {
      const d = await apiFetch('/auth/profile', { method:'PUT', body: JSON.stringify(body) })
      setUser(d.user)
      toast.success('Profile updated')
      return { ok: true }
    } catch (e) { toast.error(e.message); return { ok: false } }
  }

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, updateProfile, isAuth: !!user }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
