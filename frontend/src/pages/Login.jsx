import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

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

  const inputStyle = (focused) => ({
    width: '100%',
    background: 'rgba(8, 10, 15, 0.6)',
    border: `1.5px solid ${focused ? '#3b82f6' : '#1e2a42'}`,
    borderRadius: '14px',
    padding: '15px 20px',
    fontSize: '15px',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: focused
      ? '0 0 0 4px rgba(59,130,246,0.12), inset 0 1px 2px rgba(0,0,0,0.3)'
      : 'inset 0 1px 2px rgba(0,0,0,0.3)',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
    fontFamily: 'inherit',
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* Background ambient blobs */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      {/* Center glow behind card */}
      <div style={{
        position: 'absolute',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      }} />

      {/* Main container */}
      <div style={{
        width: '100%', maxWidth: '420px',
        position: 'relative', zIndex: 10,
        paddingTop: '24px', paddingBottom: '24px',
      }}>

        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '22px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', fontWeight: '800', fontSize: '26px',
            margin: '0 auto 24px',
            boxShadow: '0 20px 60px rgba(59,130,246,0.35), 0 4px 12px rgba(0,0,0,0.4)',
            letterSpacing: '-0.5px',
          }}>
            P$
          </div>

          <h1 style={{
            fontSize: '42px', fontWeight: '800', color: '#ffffff',
            letterSpacing: '-1.5px', margin: '0 0 10px 0',
            lineHeight: 1.1,
          }}>
            Payroll<span style={{ color: '#3b82f6' }}>OS</span>
          </h1>
          <p style={{
            color: '#5a6a8a', fontSize: '15px',
            fontWeight: '500', margin: 0, letterSpacing: '0.1px',
          }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(14, 19, 33, 0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          padding: '40px 36px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
          position: 'relative',
        }}>

          {/* Subtle top shine */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            borderRadius: '50%',
          }} />

          <form onSubmit={handleSubmit}>

            {/* Email field */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px', fontWeight: '700',
                color: '#4a5a78', letterSpacing: '1.2px',
                textTransform: 'uppercase', marginBottom: '10px',
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="admin@techcorp.in"
                required
                style={inputStyle(emailFocused)}
              />
            </div>

            {/* Password field */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px', fontWeight: '700',
                color: '#4a5a78', letterSpacing: '1.2px',
                textTransform: 'uppercase', marginBottom: '10px',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                placeholder="••••••••"
                required
                style={inputStyle(passFocused)}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading
                  ? 'rgba(59,130,246,0.5)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '14px',
                padding: '16px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading
                  ? 'none'
                  : '0 12px 32px rgba(59,130,246,0.35), 0 4px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.25s ease',
                letterSpacing: '0.2px',
                fontFamily: 'inherit',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 16px 40px rgba(59,130,246,0.45), 0 4px 8px rgba(0,0,0,0.3)'
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 12px 32px rgba(59,130,246,0.35), 0 4px 8px rgba(0,0,0,0.3)'
                }
              }}
              onMouseDown={e => { if (!loading) e.target.style.transform = 'translateY(1px)' }}
              onMouseUp={e => { if (!loading) e.target.style.transform = 'translateY(-1px)' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                  Authenticating...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Footer note */}
          <div style={{
            marginTop: '28px', textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: '24px',
          }}>
            <p style={{
              color: '#2e3a52', fontSize: '12px',
              lineHeight: '1.7', margin: 0, fontWeight: '500',
            }}>
              Secure access · Authorized personnel only
              <br />
              <span style={{
                color: '#3a4a66', borderBottom: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer', transition: 'color 0.2s',
              }}>
                Security Policy
              </span>
            </p>
          </div>
        </div>

        {/* Version tag */}
        <p style={{
          textAlign: 'center', color: '#1e2a42',
          fontSize: '11px', marginTop: '20px', fontWeight: '500',
          letterSpacing: '0.5px',
        }}>
          PayrollOS v2.0 · Enterprise Edition
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #2e3a52; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}