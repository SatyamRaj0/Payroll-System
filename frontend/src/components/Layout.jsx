import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from '../store/authStore'
import api from '../api/axios'

const NAV_SECTIONS = [
  {
    label: 'Core',
    links: [
      {
        to: '/',
        label: 'Dashboard',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/>
          </svg>
        ),
      },
      {
        to: '/employees',
        label: 'Employees',
        badge: true,
        icon: (
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        to: '/payroll',
        label: 'Payroll Engine',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8h6M5 5.5h4M5 10.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        to: '/payslips',
        label: 'Payslips',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <path d="M3 2h10v12l-2-1.5L9 14l-2-1.5L5 14l-2-1.5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M5.5 6h5M5.5 8.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Finance',
    links: [
      {
        to: '/tax',
        label: 'Tax Management',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <path d="M3 13L13 3M9 3h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
      {
        to: '/audit',
        label: 'Audit Logs',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
]

function initials(name) {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data: empData } = useQuery({
    queryKey: ['employeeCount'],
    queryFn: () => api.get('/hr/employees', { params: { page: 0, size: 1 } })
      .then(r => r.data?.totalElements ?? 0)
      .catch(() => 0),
    refetchInterval: 30000,
  })

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const displayName = user?.email?.split('@')[0] || 'Admin'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, background: 'var(--accent)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'var(--mono)',
            }}>P$</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>PayrollOS</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', letterSpacing: '.5px' }}>
                v2.4.0 · ENTERPRISE
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div style={{
                padding: '14px 16px 6px',
                fontSize: 10, fontWeight: 600, color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '1px',
              }}>
                {section.label}
              </div>
              {section.links.map(({ to, label, icon, badge }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 16px', margin: '1px 8px', borderRadius: 8,
                    fontSize: 13.5, fontWeight: isActive ? 500 : 400,
                    color: isActive ? 'var(--accent)' : 'var(--text2)',
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all .15s',
                    position: 'relative',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span style={{
                          position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
                          width: 3, height: 18, background: 'var(--accent)', borderRadius: 2,
                        }} />
                      )}
                      <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{icon}</span>
                      {label}
                      {badge && empData > 0 && (
                        <span style={{
                          marginLeft: 'auto', background: 'var(--red-bg)', color: 'var(--red)',
                          fontSize: 10, padding: '2px 6px', borderRadius: 20, fontWeight: 600,
                        }}>
                          {empData}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom user card */}
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: 10,
            background: 'var(--bg3)', borderRadius: 8, cursor: 'pointer',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {initials(displayName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>
                {displayName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {user?.role} · TechCorp India
              </div>
            </div>
            <button onClick={handleLogout}
              title="Logout"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', fontSize: 14, padding: 4, borderRadius: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ background: 'var(--bg)', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}