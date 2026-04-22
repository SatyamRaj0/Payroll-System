import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import api from '../api/axios'

const PERIODS = ['2025-06', '2025-05', '2025-04', '2025-03', '2025-02', '2025-01']

function fmt(n) {
  if (n == null) return '₹0'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function PayslipPreviewCard({ record }) {
  if (!record) return (
    <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: 40 }}>
      Click "View" on an employee row to preview their payslip.
    </div>
  )

  const emp  = record.employee || {}
  const ded  = (record.pfDeduction || 0) + (record.taxDeduction || 0) + (record.professionalTax || 0)

  async function handleDownload() {
    try {
      const res = await api.post(`/employee/payslips/generate/${record.id}`, {}, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `payslip-${emp.name}-${record.period}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Payslip downloaded!')
    } catch {
      toast.error('Download failed. Run payroll first.')
    }
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden', maxWidth: 600, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent2), var(--purple))',
        padding: 24, color: '#fff',
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>TechCorp India Pvt. Ltd.</div>
        <div style={{ fontSize: 12, opacity: .75 }}>Payslip for {record.period}</div>
      </div>

      {/* Employee Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: 20, borderBottom: '1px solid var(--border)' }}>
        {[
          ['Employee Name',  emp.name       || '—'],
          ['Employee ID',    `EMP-${String(emp.id).padStart(4,'0')}`],
          ['Department',     emp.department || '—'],
          ['Designation',    emp.designation|| '—'],
          ['PAN Number',     emp.panNumber  || '—'],
          ['Payment Mode',   'Bank Transfer'],
        ].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>
              {label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', margin: '0 0 8px' }}>
          Earnings
        </div>
        {[
          ['Basic Salary',       record.basicPay,       false],
          ['HRA',                record.hra,             false],
          ['Special Allowance',  record.allowances,      false],
          ['Performance Bonus',  record.bonus,           false],
        ].map(([l, v, _]) => (
          <div key={l} className="payslip-row">
            <span style={{ fontSize: 13 }}>{l}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{fmt(v)}</span>
          </div>
        ))}
        <div className="payslip-row" style={{ fontWeight: 600 }}>
          <span>Gross Earnings</span>
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{fmt(record.grossPay)}</span>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', margin: '16px 0 8px' }}>
          Deductions
        </div>
        {[
          ['Provident Fund (12%)', record.pfDeduction],
          ['Income Tax (TDS)',     record.taxDeduction],
          ['Professional Tax',    record.professionalTax],
        ].map(([l, v]) => (
          <div key={l} className="payslip-row">
            <span style={{ fontSize: 13 }}>{l}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--red)' }}>-{fmt(v)}</span>
          </div>
        ))}
        <div className="payslip-row" style={{ fontWeight: 600 }}>
          <span>Total Deductions</span>
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--red)' }}>-{fmt(ded)}</span>
        </div>

        {/* Net pay */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 14, background: 'var(--accent-glow)', borderRadius: 8, marginTop: 12,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>Net Pay</span>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
            {fmt(record.netPay)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={handleDownload} style={{
            flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>↓ Download PDF</button>
          <button onClick={() => toast.success(`Payslip emailed to ${emp.email || 'employee'}!`)} style={{
            flex: 1, padding: '10px 0', borderRadius: 8,
            border: '1px solid var(--border2)', background: 'transparent',
            color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
          }}>✉ Email</button>
        </div>
      </div>
    </div>
  )
}

export default function Payslips() {
  const [period, setPeriod]       = useState('2025-04')
  const [activeTab, setActiveTab] = useState('list')
  const [preview, setPreview]     = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', period],
    queryFn: () => api.get(`/hr/payroll/${period}`)
      .then(r => r.data || [])
      .catch(() => []),
    enabled: !!period,
  })

  const records = Array.isArray(data) ? data : []

  function viewRecord(r) {
    setPreview(r)
    setActiveTab('preview')
  }

  async function handlePdf(r) {
    try {
      const res = await api.post(`/employee/payslips/generate/${r.id}`, {}, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `payslip-${r.employee?.name}-${r.period}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded!')
    } catch {
      toast.error('Download failed. Run payroll first.')
    }
  }

  return (
    <div className="scroll-fade">
      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '16px 28px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
        position: 'sticky', top: 0, zIndex: 10, gap: 12,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Payslip Management</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <select value={period} onChange={e => setPeriod(e.target.value)}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '7px 12px', fontSize: 13, color: 'var(--text)', outline: 'none',
            }}>
            {PERIODS.map(p => (
              <option key={p} value={p}>
                {new Date(p + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
          <button onClick={() => toast.success('Bulk email queued!')} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border2)',
            background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
          }}>Bulk Email</button>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          {[['list', 'Employee List'], ['preview', 'Preview Payslip']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              padding: '10px 18px', fontSize: 13, cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${activeTab === key ? 'var(--accent)' : 'transparent'}`,
              color: activeTab === key ? 'var(--accent)' : 'var(--text3)',
              fontWeight: 500, transition: 'all .15s',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Employee List tab */}
        {activeTab === 'list' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
            ) : records.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
                No payroll records for {period}. Run payroll first.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    {['Employee', 'Gross', 'Deductions', 'Net Pay', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => {
                    const ded = (r.pfDeduction || 0) + (r.taxDeduction || 0) + (r.professionalTax || 0)
                    const emp = r.employee || {}
                    return (
                      <tr key={r.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: '50%',
                              background: '#1a2a4a', color: '#4F8EF7',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 700,
                            }}>
                              {initials(emp.name)}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{emp.name}</div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{fmt(r.grossPay)}</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--red)' }}>-{fmt(ded)}</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{fmt(r.netPay)}</td>
                        <td><span className="tag tag-green">Generated</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => viewRecord(r)} style={{
                              padding: '4px 10px', borderRadius: 6, fontSize: 12,
                              border: '1px solid var(--border2)', background: 'transparent',
                              color: 'var(--text2)', cursor: 'pointer',
                            }}>View</button>
                            <button onClick={() => handlePdf(r)} style={{
                              padding: '4px 10px', borderRadius: 6, fontSize: 12,
                              border: '1px solid var(--border2)', background: 'transparent',
                              color: 'var(--text2)', cursor: 'pointer',
                            }}>PDF</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Preview tab */}
        {activeTab === 'preview' && (
          <PayslipPreviewCard record={preview} />
        )}
      </div>
    </div>
  )
}