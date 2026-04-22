import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import api from '../api/axios'

const COLORS = ['#4F8EF7', '#A78BFA', '#34D399', '#FBBF24']

const TREND_MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
const TREND_VALS   = [71, 74, 78, 77, 81, 82, 84]

const DEPT_DATA = [
  { name: 'Engineering', pct: 40, color: '#4F8EF7' },
  { name: 'Product',     pct: 25, color: '#A78BFA' },
  { name: 'Design',      pct: 19, color: '#34D399' },
  { name: 'HR & Ops',    pct: 16, color: '#FBBF24' },
]

const HEALTH_ITEMS = [
  { label: 'Redis Cache',    value: '94%',     pct: 94,    color: '#34D399' },
  { label: 'Kafka Broker',   value: 'Online',  pct: 100,   color: '#34D399' },
  { label: 'DB Connections', value: '67/100',  pct: 67,    color: '#4F8EF7' },
  { label: 'Email Queue',    value: '12 pending', pct: 12, color: '#FBBF24' },
  { label: 'API Uptime',     value: '99.97%',  pct: 99.97, color: '#34D399' },
]

function fmt(n) {
  if (n == null) return '—'
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr'
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1)   + 'L'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

function StatCard({ icon, label, value, change, changeUp, iconBg }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 20,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: iconBg,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
        {value}
      </div>
      {change && (
        <div style={{ fontSize: 12, marginTop: 5, color: changeUp === false ? 'var(--text3)' : 'var(--green)' }}>
          {change}
        </div>
      )}
    </div>
  )
}

function RunPayrollModal({ open, onClose, onConfirm, loading, empCount }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 14, padding: 24, width: '100%', maxWidth: 480,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Run Payroll — April 2025</div>
          <button onClick={onClose} style={{
            background: 'var(--bg3)', border: 'none', borderRadius: 6, width: 28, height: 28,
            color: 'var(--text2)', cursor: 'pointer', fontSize: 16,
          }}>×</button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
          This will process payroll for {empCount} employees.
        </div>
        <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
          {[
            ['Employees', empCount],
            ['Period', 'April 2025'],
          ].map(([k, v]) => (
            <div key={k} className="payslip-row" style={{ fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>{k}</span>
              <span style={{ fontFamily: 'var(--mono)' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border2)',
            background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
          }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, opacity: loading ? .6 : 1,
          }}>
            {loading ? 'Running...' : 'Confirm & Run'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false)
  const [period, setPeriod] = useState('2025-04')

  const { data: empData } = useQuery({
    queryKey: ['employeeCount'],
    queryFn: () => api.get('/hr/employees', { params: { page: 0, size: 1 } })
      .then(r => r.data || { totalElements: 0 })
      .catch(() => ({ totalElements: 0 })),
  })

  const { data: payrollRecords } = useQuery({
    queryKey: ['payrollRecords', period],
    queryFn: () => api.get(`/hr/payroll/${period}`)
      .then(r => r.data || [])
      .catch(() => []),
  })

  const runMutation = useMutation({
    mutationFn: () => api.post(`/hr/payroll/run?period=${period}`),
    onSuccess: ({ data }) => {
      toast.success(`Payroll complete! ${data?.totalProcessed ?? 0} employees processed`)
      setShowModal(false)
    },
    onError: () => toast.error('Payroll run failed'),
  })

  const records = Array.isArray(payrollRecords) ? payrollRecords : []
  const totalGross = records.reduce((s, r) => s + (r.grossPay || 0), 0)
  const totalNet   = records.reduce((s, r) => s + (r.netPay   || 0), 0)
  const totalTax   = records.reduce((s, r) => s + (r.taxDeduction || 0), 0)

  const maxTrend = Math.max(...TREND_VALS)

  return (
    <div className="scroll-fade">
      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '16px 28px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
        position: 'sticky', top: 0, zIndex: 10, gap: 12,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Dashboard</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent)' }}>
            <span className="pulse" style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block',
            }} />
            Payroll running — April 2025
          </span>
          <button style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border2)',
            background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 12,
          }}>Export</button>
          <button onClick={() => setShowModal(true)} style={{
            padding: '6px 14px', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500,
          }}>Run Payroll</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 28px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard
            label="Total Employees"
            value={empData?.totalElements ?? '…'}
            change="↑ Active currently"
            iconBg="#1a2a4a"
            icon={<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="#4F8EF7" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#4F8EF7" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
          <StatCard
            label="Monthly Payroll"
            value={records.length ? fmt(totalGross) : '₹84.2L'}
            change="↑ 3.2% vs last month"
            iconBg="#0d2b1f"
            icon={<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M5 5l3-3 3 3M5 11l3 3 3-3" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
          <StatCard
            label="Tax Deducted"
            value={records.length ? fmt(totalTax) : '₹9.1L'}
            change="↑ 1.8% vs last month"
            iconBg="#2a1f00"
            icon={<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#FBBF24" strokeWidth="1.5"/><path d="M5 7h6M5 10h4" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
          <StatCard
            label="Next Pay Date"
            value="Apr 30"
            change="26 days remaining"
            changeUp={false}
            iconBg="#1a1030"
            icon={<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#A78BFA" strokeWidth="1.5"/><path d="M8 5v3l2 2" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Trend chart */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Monthly Payroll Trend</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Last 7 months</div>
              </div>
              <span className="tag tag-green">+8.4% YTD</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
              {TREND_VALS.map((v, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>₹{v}L</div>
                  <div style={{
                    width: '100%', height: `${Math.round(v / maxTrend * 90)}px`,
                    background: i === 6 ? 'var(--accent)' : 'var(--border2)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'opacity .2s',
                  }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {TREND_MONTHS.map((m, i) => (
                <div key={m} style={{
                  flex: 1, textAlign: 'center', fontSize: 10,
                  color: i === 6 ? 'var(--accent)' : 'var(--text3)',
                }}>
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* Donut chart */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
              Dept. Salary Distribution
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="40" fill="none" stroke="#1E2535" strokeWidth="22"/>
                <circle cx="55" cy="55" r="40" fill="none" stroke="#4F8EF7" strokeWidth="22" strokeDasharray="100.5 150.8" strokeDashoffset="-12.6" transform="rotate(-90 55 55)"/>
                <circle cx="55" cy="55" r="40" fill="none" stroke="#A78BFA" strokeWidth="22" strokeDasharray="62.8 188.5" strokeDashoffset="-113.1" transform="rotate(-90 55 55)"/>
                <circle cx="55" cy="55" r="40" fill="none" stroke="#34D399" strokeWidth="22" strokeDasharray="47.1 204.2" strokeDashoffset="-175.9" transform="rotate(-90 55 55)"/>
                <circle cx="55" cy="55" r="40" fill="none" stroke="#FBBF24" strokeWidth="22" strokeDasharray="31.4 219.9" strokeDashoffset="-223" transform="rotate(-90 55 55)"/>
                <text x="55" y="51" textAnchor="middle" fill="#E8EDF8" fontSize="12" fontWeight="600" fontFamily="DM Mono">₹84L</text>
                <text x="55" y="64" textAnchor="middle" fill="#5A6480" fontSize="9">total</text>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DEPT_DATA.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text2)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    {d.name} · {d.pct}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          {/* Recent runs */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Recent Payroll Runs</div>
              <span className="tag tag-blue">Live</span>
            </div>
            <table>
              <thead>
                <tr>
                  {['Month', 'Employees', 'Gross', 'Net', 'Status'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? records.slice(0, 4).map(r => (
                  <tr key={r.id}>
                    <td>{r.period}</td>
                    <td style={{ color: 'var(--text2)' }}>—</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{fmt(r.grossPay)}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{fmt(r.netPay)}</td>
                    <td><span className="tag tag-green">{r.status}</span></td>
                  </tr>
                )) : (
                  [
                    { m: 'Apr 2025', e: 248, g: '₹94.3L', n: '₹84.2L', s: 'Processing', cls: 'tag-amber' },
                    { m: 'Mar 2025', e: 244, g: '₹91.8L', n: '₹81.5L', s: 'Completed',  cls: 'tag-green' },
                    { m: 'Feb 2025', e: 240, g: '₹89.2L', n: '₹79.1L', s: 'Completed',  cls: 'tag-green' },
                    { m: 'Jan 2025', e: 238, g: '₹87.6L', n: '₹77.8L', s: 'Completed',  cls: 'tag-green' },
                  ].map(r => (
                    <tr key={r.m}>
                      <td>{r.m}</td>
                      <td style={{ color: 'var(--text2)' }}>{r.e}</td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{r.g}</td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{r.n}</td>
                      <td><span className={`tag ${r.cls}`}>{r.s}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* System health */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>System Health</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {HEALTH_ITEMS.map(h => (
                <div key={h.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text2)' }}>{h.label}</span>
                    <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{h.value}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${h.pct}%`, background: h.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RunPayrollModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => runMutation.mutate()}
        loading={runMutation.isPending}
        empCount={empData?.totalElements ?? '…'}
      />
    </div>
  )
}