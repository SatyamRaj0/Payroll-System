import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('ui-theme') || 'light')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ui-theme', theme)
  }, [theme])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(
        { email: data.data.email, role: data.data.role },
        data.data.accessToken,
        data.data.refreshToken
      )
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      display: 'grid',
      placeItems: 'center',
      background: 'radial-gradient(circle at 15% 10%, var(--accent-glow), transparent 40%), var(--bg)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 430,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        boxShadow: 'var(--shadow)',
        padding: 28,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--accent)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--mono)',
            }}>
              P$
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>PayrollOS</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Sign in to continue</div>
            </div>
          </div>

          <button
            onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
            style={{
              border: '1px solid var(--border2)',
              background: 'var(--bg3)',
              color: 'var(--text2)',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="hr@techcorp.in"
            required
            className="form-input"
            style={{ marginBottom: 14 }}
          />

          <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            className="form-input"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 18,
              border: 'none',
              background: loading ? 'var(--text3)' : 'var(--accent)',
              color: '#fff',
              borderRadius: 10,
              padding: '11px 14px',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 18, color: 'var(--text3)', fontSize: 12 }}>
          Demo login: hr@techcorp.in / hr123
        </div>
      </div>
    </div>
  )
}
