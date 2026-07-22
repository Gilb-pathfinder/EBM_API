import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { authApi } from '../api/auth'

async function pingVsdc() {
  try {
    const res = await fetch('/api/health/vsdc')
    const data = await res.json().catch(() => ({}))
    return data.online === true
  } catch {
    return false
  }
}

const AppContext = createContext(null)

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || 'U'
}

export function AppProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('vsdc_token') || null)
  const [user, setUser] = useState(null)
  const [vsdcStatus, setVsdcStatus] = useState('checking')
  const pollRef = useRef(null)

  // Only block render while fetching user info — not needed for admin sessions or logged-out state
  const needsFetch = !!localStorage.getItem('vsdc_token') && localStorage.getItem('vsdc_is_admin') !== '1'
  const [authLoading, setAuthLoading] = useState(needsFetch)

  const logout = useCallback(() => {
    localStorage.removeItem('vsdc_token')
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(() => {
    return authApi.userInfo().then(data => setUser(data))
  }, [])

  const login = useCallback(async (email, password, isAdmin = false) => {
    const res = isAdmin
      ? await authApi.loginAdmin(email, password)
      : await authApi.loginUser(email, password)
    // Both admin and user login return { type, value, msg } — token string is in `value`
    const t = res?.value ?? res?.token?.token ?? res?.token
    if (!t || typeof t !== 'string') throw new Error('No token received from server')
    localStorage.setItem('vsdc_token', t)
    localStorage.setItem('vsdc_is_admin', isAdmin ? '1' : '0')
    setToken(t)
    return t
  }, [])

  useEffect(() => {
    if (!token) return
    if (localStorage.getItem('vsdc_is_admin') === '1') return  // admin guard ≠ api guard
    authApi.userInfo()
      .then(data => setUser(data))
      .catch(() => logout())
      .finally(() => setAuthLoading(false))
  }, [token, logout])

  // Poll VSDC WAR health every 30 seconds
  useEffect(() => {
    function check() {
      pingVsdc().then(online => setVsdcStatus(online ? 'online' : 'offline'))
    }
    check()
    pollRef.current = setInterval(check, 30_000)
    return () => clearInterval(pollRef.current)
  }, [])

  const isAdmin = token ? localStorage.getItem('vsdc_is_admin') === '1' : false

  const profile = user ? {
    name:     user.fullName     || user.taxPayerName || 'Operator',
    role:     user.taxPayerName || 'Device Operator',
    initials: getInitials(user.fullName || user.taxPayerName),
    tin:      user.tin          || '—',
    branch:   user.branchName   || '—',
    device:   user.sdcId        || user.serialNo || '—',
    isTrainingMode: user.isTrainingMode || false,
  } : isAdmin ? {
    name: 'Administrator', role: 'Admin', initials: 'AD',
    tin: '—', branch: '—', device: '—', isTrainingMode: false,
  } : null

  return (
    <AppContext.Provider value={{ token, isAdmin, user: profile, rawUser: user, login, logout, refreshUser, authLoading, vsdcStatus, setVsdcStatus }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
