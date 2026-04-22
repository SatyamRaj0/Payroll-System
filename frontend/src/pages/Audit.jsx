import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

const ACTION_ICONS = {
  PAYROLL_RUN:        { bg: '#1a2a4a', color: '#4F8EF7', icon: '💳' },
  EMPLOYEE_CREATED:   { bg: '#1a1030', color: '#A78BFA', icon: '👤' },
  EMPLOYEE_UPDATED:   { bg: '#0d2b1f', color: '#34D399', icon: '✏️' },
  EMPLOYEE_TERMINATED:{ bg: '#2b0d0d', color: '#F87171', icon: '🚫' },
  PAYSLIP_GENERATED:  { bg: '#0d2b1f', color: '#34D399', icon: '📄' },
  TAX_UPDATE:         { bg: '#2a1f00', color: '#FBBF24', icon: '⚙️' },
  DEFAULT:            { bg: '#1a2a4a', color: '#4F8EF7', icon: '🔹' },
}

function getIconStyle(action) {
  for (const [key, val] of Object.entries(ACTION_ICONS)) {
    if (action?.startsWith(key)) return val
  }
  return ACTION_ICONS.DEFAULT
}

function exportCsv(logs) {
  const header = 'ID,Action,Entity Type,Entity ID,Performed By,Details,Timestamp'
  const rows = logs.map(l =>
    [l.id, l.action, l.entityType, l.entityId, l.performedBy, `"${(l.details||'').replace(/"/g,'""')}"`, l.createdAt].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Audit() {
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', page],
    queryFn: () => api.get('/admin/audit', { params: { page, size: 20 } })
      .then(r => r.data?.data || { content: [], totalPages: 1 })
      .catch(() => ({ content: [], totalPages: 1 })),
  })

  const logs = data?.content || []

  const filtered = useMemo(() => {
    if (!search.trim()) return logs
    const q = search.toLowerCase()
    return logs.filter(l =>
      l.action?.toLowerCase().includes(q) ||
      l.entityType?.toLowerCase().includes(q) ||
      l.performedBy?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q)
    )
  }, [logs, search])

  function timeAgo(dt) {
    if (!dt) return '—'
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="scroll-fade">
      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '16px 28px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
        position: 'sticky', top: 0, zIndex: 10, gap: 12,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Audit Logs</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search logs..."
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 14px 8px 32px', fontSize: 13,
                color: 'var(--text2)', outline: 'none', width: 220,
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button onClick={() => exportCsv(filtered)} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border2)',
            background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
          }}>Export CSV</button>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
              {search ? 'No logs match your search.' : 'No audit logs yet.'}
            </div>
          ) : (
            <div>
              {filtered.map((log, i) => {
                const style = getIconStyle(log.action)
                return (
                  <div key={log.id ?? i} style={{
                    display: 'flex', gap: 12, padding: '14px 20px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background .15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: style.bg, color: style.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, marginTop: 1,
                    }}>
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
                        {log.action?.replace(/_/g, ' ')}
                        {log.entityType && <span style={{ color: 'var(--text3)', fontWeight: 400 }}> · {log.entityType}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {log.details}
                        {log.performedBy && (
                          <span style={{ marginLeft: 8, color: 'var(--accent)', fontSize: 11 }}>
                            by {log.performedBy}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1 }}>
                      {timeAgo(log.createdAt)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {(data?.totalPages > 1) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text3)' }}>
              Page {page + 1} of {data?.totalPages}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['← Prev', () => setPage(p => p - 1), page === 0],
                ['Next →', () => setPage(p => p + 1), page >= (data?.totalPages - 1)]
              ].map(([lbl, fn, disabled]) => (
                <button key={lbl} onClick={fn} disabled={disabled}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13,
                    border: '1px solid var(--border2)', background: 'transparent',
                    color: 'var(--text2)', cursor: disabled ? 'default' : 'pointer',
                    opacity: disabled ? .4 : 1,
                  }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}