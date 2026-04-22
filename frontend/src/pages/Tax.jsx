import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import api from '../api/axios'

const TAX_SLABS_FALLBACK = [
  { lowerLimit: 0,         upperLimit: 300000,  rate: 0  },
  { lowerLimit: 300000,    upperLimit: 600000,  rate: 5  },
  { lowerLimit: 600000,    upperLimit: 900000,  rate: 10 },
  { lowerLimit: 900000,    upperLimit: 1200000, rate: 15 },
  { lowerLimit: 1200000,   upperLimit: 1500000, rate: 20 },
  { lowerLimit: 1500000,   upperLimit: null,    rate: 30 },
]

function computeTaxBreakdown(gross, slabs) {
  let tax = 0
  let remaining = gross
  const breakdown = []
  for (const s of slabs) {
    const lo = Number(s.lowerLimit)
    const hi = s.upperLimit ? Number(s.upperLimit) : Infinity
    if (remaining <= 0) break
    const taxable = Math.min(remaining, hi === Infinity ? remaining : hi - lo)
    if (taxable <= 0) continue
    const t = taxable * Number(s.rate) / 100
    if (Number(s.rate) > 0) {
      breakdown.push({ label: `${s.rate}% on ₹${Math.round(taxable).toLocaleString('en-IN')}`, amount: t })
    }
    tax += t
    remaining -= taxable
  }
  const cess = tax * 0.04
  return { breakdown, tax, cess, total: tax + cess }
}

function fmt(n) {
  if (n == null || isNaN(n)) return '₹0'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

function AddSlabModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ lowerLimit: '', upperLimit: '', rate: '', fiscalYear: '2026-2027', regime: 'NEW' })
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 14, padding: 24, width: '100%', maxWidth: 440,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Add Tax Slab</div>
          <button onClick={onClose} style={{
            background: 'var(--bg3)', border: 'none', borderRadius: 6,
            width: 28, height: 28, color: 'var(--text2)', cursor: 'pointer', fontSize: 16,
          }}>×</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            ['Lower Limit (₹)', 'lowerLimit', 'number'],
            ['Upper Limit (₹)', 'upperLimit', 'number'],
            ['Tax Rate (%)',     'rate',       'number'],
            ['Fiscal Year',     'fiscalYear', 'text'],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                {label}
              </label>
              <input type={type} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="form-input" placeholder={key === 'upperLimit' ? 'Leave blank for ∞' : ''} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Regime
            </label>
            <select value={form.regime} onChange={e => setForm(f => ({ ...f, regime: e.target.value }))}
              className="form-input">
              <option value="NEW">New Regime</option>
              <option value="OLD">Old Regime</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border2)',
            background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
          }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose() }} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>Save Slab</button>
        </div>
      </div>
    </div>
  )
}

export default function Tax() {
  const [incomeInput, setIncomeInput] = useState('1440000')
  const income = Number(incomeInput) || 0
  const [showModal, setShowModal] = useState(false)
  const qc = useQueryClient()

  const { data: slabs } = useQuery({
    queryKey: ['taxSlabs'],
    queryFn: () => api.get('/hr/tax/slabs')
      .then(r => r.data?.data || TAX_SLABS_FALLBACK)
      .catch(() => TAX_SLABS_FALLBACK),
  })

  const addMutation = useMutation({
    mutationFn: slab => api.post('/hr/tax/slabs', {
      lowerLimit: Number(slab.lowerLimit),
      upperLimit: slab.upperLimit ? Number(slab.upperLimit) : null,
      rate: Number(slab.rate),
      fiscalYear: slab.fiscalYear,
      regime: slab.regime,
      active: true,
    }),
    onSuccess: () => { qc.invalidateQueries(['taxSlabs']); toast.success('Tax slab added!') },
    onError: () => toast.error('Failed to add slab'),
  })

  const effectiveSlabs = slabs || TAX_SLABS_FALLBACK
  const { breakdown, cess, total } = computeTaxBreakdown(income, effectiveSlabs)
  const effectiveRate = income > 0 ? ((total / income) * 100).toFixed(1) : '0.0'

  return (
    <div className="scroll-fade">
      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '16px 28px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
        position: 'sticky', top: 0, zIndex: 10, gap: 12,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Tax Management</h1>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => setShowModal(true)} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>+ Add Slab</button>
        </div>
      </div>

      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Tax Slabs */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
              Indian Tax Slabs — FY 2025-26
            </div>
            <span className="tag tag-green">New Regime</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {effectiveSlabs.map((s, i) => {
              const lo = Number(s.lowerLimit)
              const hi = s.upperLimit ? Number(s.upperLimit) : null
              const rate = Number(s.rate)
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 12, background: 'var(--bg3)', borderRadius: 8,
                }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text2)', flex: 1 }}>
                    ₹{(lo / 100000).toFixed(0)}L{hi ? ` – ₹${(hi / 100000).toFixed(0)}L` : '+'}
                  </span>
                  <div className="slab-bar">
                    <div className="slab-fill" style={{ width: `${rate === 0 ? 3 : (rate / 30) * 100}%` }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--amber)', fontFamily: 'var(--mono)', width: 36, textAlign: 'right' }}>
                    {rate}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tax Calculator */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Tax Computation</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Annual Gross Salary (₹)
            </label>
            <input
              type="text"
              value={incomeInput}
              onChange={e => {
                // Allow only digits or empty string
                const val = e.target.value
                if (/^\d*$/.test(val)) setIncomeInput(val)
              }}
              className="form-input"
              placeholder="Enter amount"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {breakdown.map((b, i) => (
              <div key={i} className="payslip-row" style={{ fontSize: 12 }}>
                <span style={{ color: 'var(--text2)' }}>{b.label}</span>
                <span style={{ fontFamily: 'var(--mono)' }}>{fmt(b.amount)}</span>
              </div>
            ))}
            <div className="payslip-row" style={{ fontSize: 12 }}>
              <span style={{ color: 'var(--text2)' }}>Health & Education Cess (4%)</span>
              <span style={{ fontFamily: 'var(--mono)' }}>{fmt(cess)}</span>
            </div>
          </div>

          <div style={{
            background: 'var(--amber-bg)', border: '1px solid rgba(251,191,36,.2)',
            borderRadius: 8, padding: 12, marginTop: 12,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)' }}>Total Annual Tax</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
              {fmt(total)}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Monthly TDS</div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text)' }}>
                {fmt(total / 12)}
              </div>
            </div>
            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Effective Rate</div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--amber)' }}>
                {effectiveRate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddSlabModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={form => addMutation.mutate(form)}
      />
    </div>
  )
}