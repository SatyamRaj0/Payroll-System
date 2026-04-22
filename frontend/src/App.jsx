import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Payroll from './pages/Payroll'
import Payslips from './pages/Payslips'
import Tax from './pages/Tax'
import Audit from './pages/Audit'
import api from './api/axios'

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  const token = useAuthStore(s => s.token)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  useEffect(() => {
    async function validateToken() {
      if (token) {
        try {
          // Replace with your backend endpoint for token validation
          await api.get('/auth/validate')
        } catch (err) {
          logout()
          navigate('/login', { replace: true })
        }
      }
    }
    validateToken()
    // Only run on mount or when token changes
    // eslint-disable-next-line
  }, [token])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="payslips" element={<Payslips />} />
        <Route path="tax" element={<Tax />} />
        <Route path="audit" element={<Audit />} />
      </Route>
    </Routes>
  )
}