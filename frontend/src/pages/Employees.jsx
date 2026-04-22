import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import api from '../api/axios'

const DEPT_OPTIONS = ['Engineering', 'Product', 'Design', 'HR & Ops', 'Operations', 'Finance']
const AVATAR_COLORS = {
  Engineering: ['#4F8EF7', '#1a2a4a'],
  Product:     ['#A78BFA', '#1a1030'],
  Design:      ['#34D399', '#0d2b1f'],
  'HR & Ops':  ['#FBBF24', '#2a1f00'],
}

function avatarColor(dept) {
  return AVATAR_COLORS[dept] || ['#4F8EF7', '#1a2a4a']
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function EmployeeModal({ open, onClose, onSave, initial, title }) {
  const [form, setForm] = useState(initial || {
    name: '', email: '', phone: '', department: 'Engineering',
    designation: '', panNumber: '', bankAccount: '', ifscCode: '',
  })

  if (!open) return null

  const fields = [
    ['Full Name',    'name',        'text'],
    ['Email',        'email',       'email'],
    ['Phone',        'phone',       'text'],
    ['Designation',  'designation', 'text'],
    ['PAN Number',   'panNumber',   'text'],
    ['Bank Account', 'bankAccount', 'text'],
    ['IFSC Code',    'ifscCode',    'text'],
  ]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 14, padding: 24, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
          <button onClick={onClose} style={{
            background: 'var(--bg3)', border: 'none', borderRadius: 6,
            width: 28, height: 28, color: 'var(--text2)', cursor: 'pointer', fontSize: 16,
          }}>×</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {fields.map(([label, key, type]) => (
            <div key={key}>
              <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                {label}
              </label>
              <input type={type} value={form[key] || ''}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="form-input" />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Department
            </label>
            <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              className="form-input">
              {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
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
          }}>Save Employee</button>
        </div>
      </div>
    </div>
  )
}

function EmployeeSalary({ empId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['salary', empId],
    queryFn: () => api.get(`/hr/employees/${empId}/salary`).then(r => r.data).catch(() => null),
    staleTime: 60000,
  })
  
  if (isLoading) return <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>
  if (!data) return <span style={{ color: 'var(--text3)', fontSize: 12 }}>Not set</span>
  
  const basic = Number(data.basic || 0)
  const hra = Number(data.hra || 0)
  const allowances = Number(data.allowances || 0)
  const bonus = basic * (Number(data.bonusPercent || 0) / 100)
  const total = basic + hra + allowances + bonus
  
  return (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' }}>
      ₹{Math.round(total).toLocaleString('en-IN')}
    </div>
  )
}

export default function Employees() {
  const [search, setSearch]         = useState('')
  const [dept, setDept]             = useState('')
  const [page, setPage]             = useState(0)
  const [showAdd, setShowAdd]       = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, dept, page],
    queryFn: () => api.get('/hr/employees', { params: { search, department: dept || undefined, page, size: 10 } })
      .then(r => r.data || { content: [], totalPages: 1, totalElements: 0 })
      .catch(() => ({ content: [], totalPages: 1, totalElements: 0 })),
    placeholderData: prev => prev,
  })

  const addMutation = useMutation({
    mutationFn: emp => api.post('/hr/employees', emp),
    onSuccess: () => { qc.invalidateQueries(['employees']); toast.success('Employee added!') },
    onError: () => toast.error('Failed to add employee'),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...emp }) => api.put(`/hr/employees/${id}`, emp),
    onSuccess: () => { qc.invalidateQueries(['employees']); toast.success('Employee updated!') },
    onError: () => toast.error('Update failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/hr/employees/${id}`),
    onSuccess: () => { qc.invalidateQueries(['employees']); toast.success('Employee terminated') },
  })

  const employees = data?.content || []

  // Compute quick stats from current page (approximate)
  const activeCount = employees.filter(e => e.status === 'ACTIVE').length
  const leaveCount  = employees.filter(e => e.status === 'ON_LEAVE').length
  const probCount   = employees.filter(e => e.status === 'PROBATION').length

  const avgSalaryComponent = (
    <div style={{ fontSize: 13, color: 'var(--text3)' }}>
       Loads via structures
    </div>
  )

  return (
    <div className="scroll-fade">
      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '16px 28px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
        position: 'sticky', top: 0, zIndex: 10, gap: 12,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Employee Management</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search employees..."
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 14px 8px 32px', fontSize: 13,
                color: 'var(--text2)', outline: 'none', width: 220,
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          {/* Dept filter */}
          <select value={dept} onChange={e => { setDept(e.target.value); setPage(0) }}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 12px', fontSize: 13,
              color: 'var(--text2)', outline: 'none', cursor: 'pointer',
            }}>
            <option value="">All Departments</option>
            {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
          </select>
          <button onClick={() => setShowAdd(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Employee
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Active',    value: data?.totalElements ?? 0, color: 'var(--green)' },
            { label: 'On Leave',  value: leaveCount,               color: 'var(--amber)' },
            { label: 'Probation', value: probCount,                color: 'var(--purple)' },
            { label: 'Avg Salary', value: '₹1.24L',              color: 'var(--text)' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20,
            }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, color: s.color, fontFamily: 'var(--mono)' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : employees.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
              No employees found.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  {['Employee', 'Department', 'Role', 'Salary', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const [fg, bg] = avatarColor(emp.department)
                  const statusTag = emp.status === 'ACTIVE' ? 'tag-green'
                    : emp.status === 'ON_LEAVE' ? 'tag-amber' : 'tag-purple'
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: bg, color: fg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, flexShrink: 0,
                          }}>
                            {initials(emp.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text2)' }}>{emp.department}</td>
                      <td style={{ color: 'var(--text2)' }}>{emp.designation}</td>
                      <td>
                        <EmployeeSalary empId={emp.id} />
                      </td>
                      <td>
                        <span className={`tag ${statusTag}`}>
                          {emp.status === 'ON_LEAVE' ? 'On Leave' : emp.status === 'ACTIVE' ? 'Active' : emp.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => setEditTarget(emp)}
                            style={{
                              padding: '5px 10px', borderRadius: 6, fontSize: 12,
                              border: '1px solid var(--border2)', background: 'transparent',
                              color: 'var(--text2)', cursor: 'pointer',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Terminate ${emp.name}?`)) deleteMutation.mutate(emp.id)
                            }}
                            style={{
                              padding: '5px 10px', borderRadius: 6, fontSize: 12,
                              border: '1px solid var(--border2)', background: 'transparent',
                              color: 'var(--text2)', cursor: 'pointer',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>
            Page {page + 1} of {data?.totalPages || 1} · {data?.totalElements || 0} employees
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
      </div>

      {/* Add modal */}
      <EmployeeModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={form => addMutation.mutate(form)}
        title="Add Employee"
      />

      {/* Edit modal */}
      <EmployeeModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={form => editMutation.mutate({ id: editTarget.id, ...form })}
        initial={editTarget}
        title={`Edit — ${editTarget?.name || ''}`}
      />
    </div>
  )
}