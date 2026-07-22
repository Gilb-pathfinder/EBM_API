import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import BrandMark from '../../components/ui/BrandMark'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin]   = useState(true)   // default to admin since no device users exist yet
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  function switchMode(admin) {
    setIsAdmin(admin)
    setError(null)
    setEmail('')
    setPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password, isAdmin)
      navigate(isAdmin ? '/admin/users' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-card__brand">
          <BrandMark size={48} />
          <div>
            <div className="brand-name" style={{ fontSize: '20px' }}>VSDC Manager</div>
            <div className="brand-sub">EBM 2.1 — RRA Compliant</div>
          </div>
        </div>

        {/* Mode switcher */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab${isAdmin ? ' is-active' : ''}`}
            onClick={() => switchMode(true)}
          >
            Administrator
          </button>
          <button
            type="button"
            className={`login-tab${isAdmin ? '' : ' is-active'}`}
            onClick={() => switchMode(false)}
          >
            Device Operator
          </button>
        </div>

        {error && (
          <div className="login-error">
            <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={isAdmin ? 'admin@test.com' : 'operator@company.rw'}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : `Sign in as ${isAdmin ? 'Admin' : 'Operator'}`}
          </button>
        </form>

        <div className="login-card__footer">
          VSDC Manager v1.0 · RRA EBM 2.1
        </div>
      </div>
    </div>
  )
}
