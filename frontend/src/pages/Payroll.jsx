import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import api from '../api/axios'

const ENGINE_STEPS = [
  { num: '01', title: 'Data Validation',   desc: 'Verify employee records, salary structures, and attendance data. Check for missing fields and flag anomalies.' },
  { num: '02', title: 'Gross Calculation', desc: 'Compute basic salary, HRA, allowances, and bonuses using configurable rule engine formulas.' },
  { num: '03', title: 'Tax Computation',   desc: 'Apply dynamic Indian tax slabs from DB. Calculate TDS based on annual projected income using the slab engine.' },
  { num: '04', title: 'PF & Statutory',    desc: 'Apply EPF (12% employer + employee), ESI, and professional tax deductions per jurisdiction rules.' },
  { num: '05', title: 'Net Salary',        desc: 'Final net = Gross − All deductions. Validate against minimum wage rules before committing.' },
  { num: '06', title: 'Payslip Generation', desc: 'Generate PDF payslips, persist to DB, emit Kafka event triggering email service.' },
]

function fmt(n) {
  if (n == null) return '₹0'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}




function CalcPanel({ salary }) {
  const [inputs, setInputs] = useState({
    basic: '',
    hra: '',
    allowances: '',
    bonusPercent: '',
  })

  useEffect(() => {
    if (salary) {
      setInputs({
        basic: salary.basic === 0 || salary.basic === null ? '' : String(salary.basic ?? ''),
        hra: salary.hra === 0 || salary.hra === null ? '' : String(salary.hra ?? ''),
        allowances: salary.allowances === 0 || salary.allowances === null ? '' : String(salary.allowances ?? ''),
        bonusPercent: salary.bonusPercent === 0 || salary.bonusPercent === null ? '' : String(salary.bonusPercent ?? ''),
      })
    }
  }, [salary])

  if (!salary) return (
    <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: 30 }}>
      Select an employee to preview salary breakdown
    </div>
  )

  const handleInput = e => {
    const { name, value } = e.target
    // Only allow numbers or empty string
    if (/^\d*$/.test(value)) {
      setInputs(prev => ({ ...prev, [name]: value }))
    }
  }

  const basic    = Number(inputs.basic    || 0)
  const hra      = Number(inputs.hra      || 0)
  const allow    = Number(inputs.allowances || 0)
  const bonusPct = Number(inputs.bonusPercent || 0)
  const bonus    = basic * bonusPct / 100
  const gross    = basic + hra + allow + bonus
  const pf       = basic * 0.12
  const annualTax = gross * 12
  let tax = 0
  for (const [lo, hi, rate] of [[0,300000,0],[300000,600000,5],[600000,900000,10],[900000,1200000,15],[1200000,1500000,20],[1500000,Infinity,30]]) {
    if (annualTax <= lo) break
    tax += (Math.min(annualTax, hi) - lo) * rate / 100
  }
  const monthlyTax = (tax * 1.04) / 12
  const pt  = 200
  const net = gross - pf - monthlyTax - pt

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.5px' }}>Earnings</div>
        <div className="payslip-row" style={{ padding: '5px 0', fontSize: 12 }}>
          <span style={{ color: 'var(--text2)' }}>Basic</span>
          <input
            name="basic"
            value={inputs.basic}
            onChange={handleInput}
            style={{ width: 60, fontFamily: 'var(--mono)', fontSize: 12, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}
            placeholder="0"
            autoComplete="off"
          />
        </div>
        <div className="payslip-row" style={{ padding: '5px 0', fontSize: 12 }}>
          <span style={{ color: 'var(--text2)' }}>HRA</span>
          <input
            name="hra"
            value={inputs.hra}
            onChange={handleInput}
            style={{ width: 60, fontFamily: 'var(--mono)', fontSize: 12, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}
            placeholder="0"
            autoComplete="off"
          />
        </div>
        <div className="payslip-row" style={{ padding: '5px 0', fontSize: 12 }}>
          <span style={{ color: 'var(--text2)' }}>Allowance</span>
          <input
            name="allowances"
            value={inputs.allowances}
            onChange={handleInput}
            style={{ width: 60, fontFamily: 'var(--mono)', fontSize: 12, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}
            placeholder="0"
            autoComplete="off"
          />
        </div>
        <div className="payslip-row" style={{ padding: '5px 0', fontSize: 12 }}>
          <span style={{ color: 'var(--text2)' }}>Bonus %</span>
          <input
            name="bonusPercent"
            value={inputs.bonusPercent}
            onChange={handleInput}
            style={{ width: 60, fontFamily: 'var(--mono)', fontSize: 12, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}
            placeholder="0"
            autoComplete="off"
          />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 12 }}>
          <span>Gross</span>
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{fmt(gross)}</span>
        </div>
      </div>

      <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.5px' }}>Deductions</div>
        {[['PF (12%)', pf], ['Income Tax', monthlyTax], ['Prof. Tax', pt]].map(([l, v]) => (
          <div key={l} className="payslip-row" style={{ padding: '5px 0', fontSize: 12 }}>
            <span style={{ color: 'var(--text2)' }}>{l}</span>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--red)' }}>-{fmt(v)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 12 }}>
          <span>Total</span>
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--red)' }}>-{fmt(pf + monthlyTax + pt)}</span>
        </div>
      </div>

      <div style={{
        background: 'var(--accent-glow)', border: '1px solid var(--accent)',
        borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Net Pay</div>
        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{fmt(net)}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Per month</div>
      </div>
    </div>
  )
}

export default function Payroll() {
  const [period, setPeriod]     = useState('2025-05')
  const [result, setResult]     = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [simDots, setSimDots]   = useState(ENGINE_STEPS.map(() => [false, false, false, false, false]))
  const [selectedEmpId, setSelectedEmpId] = useState(null)

  const { data: empList } = useQuery({
    queryKey: ['employeeList'],
    queryFn: () => api.get('/hr/employees', { params: { page: 0, size: 100 } })
      .then(r => r.data?.content || [])
      .catch(() => []),
  })

  const { data: salaryData } = useQuery({
    queryKey: ['salary', selectedEmpId],
    queryFn: () => api.get(`/hr/employees/${selectedEmpId}/salary`).then(r => r.data).catch(() => null),
    enabled: !!selectedEmpId,
  })

  const { data: empCount } = useQuery({
    queryKey: ['employeeCount'],
    queryFn: () => api.get('/hr/employees', { params: { page: 0, size: 1 } })
      .then(r => r.data?.totalElements ?? 0).catch(() => 0),
  })

  const runMutation = useMutation({
    mutationFn: p => api.post(`/hr/payroll/run?period=${p}`),
    onSuccess: ({ data }) => {
      setResult(data)
      toast.success(`Payroll complete! ${data.totalProcessed ?? 0} employees processed`)
      setShowConfirm(false)
    },
    onError: () => { toast.error('Payroll run failed'); setShowConfirm(false) },
  })

  function runSimulation() {
    toast('Simulation started…', { icon: '▶' })
    setSimDots(ENGINE_STEPS.map(() => [false, false, false, false, false]))
    ENGINE_STEPS.forEach((_, stepIdx) => {
      setTimeout(() => {
        setSimDots(prev => prev.map((dots, i) =>
          i === stepIdx ? dots.map(() => true) : dots
        ))
        if (stepIdx === ENGINE_STEPS.length - 1) {
          toast.success('Simulation complete! All steps done.')
        }
      }, (stepIdx + 1) * 500)
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
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Payroll Engine</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '7px 12px', fontSize: 13, color: 'var(--text)', outline: 'none',
            }} />
          <button onClick={runSimulation} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border2)',
            background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
          }}>▶ Run Simulation</button>
          <button onClick={() => setShowConfirm(true)} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>Run Payroll</button>
        </div>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Result banner */}
        {result && (
          <div style={{
            background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.3)',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: 10 }}>
              ✓ Run Complete — {result.period}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[['Processed', result.totalProcessed, 'var(--text)'],
                ['Failed', result.totalFailed, 'var(--red)'],
                ['Period', result.period, 'var(--text2)']
              ].map(([l, v, c]) => (
                <div key={l} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Salary Breakdown Calculator */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Salary Breakdown Calculator</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Real-time payroll computation preview</div>
            </div>
            <select
              value={selectedEmpId || ''}
              onChange={e => setSelectedEmpId(e.target.value || null)}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '7px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', width: 220,
              }}
            >
              <option value="">— Select Employee —</option>
              {(empList || []).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <CalcPanel salary={salaryData} />
        </div>

        {/* Pipeline */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Processing Pipeline</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {ENGINE_STEPS.map((s, idx) => (
              <div key={s.num} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 18, position: 'relative',
              }}>
                <div style={{
                  width: 24, height: 24, background: 'var(--accent-glow)', color: 'var(--accent)',
                  borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, marginBottom: 10, fontFamily: 'var(--mono)',
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 5 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>{s.desc}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                  {simDots[idx].map((done, di) => (
                    <div key={di} className={`indicator-dot${done ? ' done' : ''}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowConfirm(false)}>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border2)',
            borderRadius: 14, padding: 24, width: '100%', maxWidth: 440,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                Run Payroll — {period}
              </div>
              <button onClick={() => setShowConfirm(false)} style={{
                background: 'var(--bg3)', border: 'none', borderRadius: 6,
                width: 28, height: 28, color: 'var(--text2)', cursor: 'pointer', fontSize: 16,
              }}>×</button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
              This will process payroll for <strong style={{ color: 'var(--text)' }}>{empCount}</strong> employees for period <strong style={{ color: 'var(--accent)' }}>{period}</strong>.
            </div>
            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div className="payslip-row" style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>Period</span>
                <span style={{ fontFamily: 'var(--mono)' }}>{period}</span>
              </div>
              <div className="payslip-row" style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>Employees</span>
                <span style={{ fontFamily: 'var(--mono)' }}>{empCount}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowConfirm(false)} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border2)',
                background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
              }}>Cancel</button>
              <button onClick={() => runMutation.mutate(period)} disabled={runMutation.isPending} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, opacity: runMutation.isPending ? .6 : 1,
              }}>
                {runMutation.isPending ? 'Processing…' : 'Confirm & Run'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}