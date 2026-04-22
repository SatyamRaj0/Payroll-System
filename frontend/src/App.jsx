import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
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

function PrivateRoute({ children, checkingAuth }) {
  const token = useAuthStore(s => s.token)
  if (checkingAuth) {
    return null
  }
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  const token = useAuthStore(s => s.token)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    let mounted = true

    async function validateToken() {
      if (!token) {
        if (mounted) setCheckingAuth(false)
        return
      }

      if (mounted) setCheckingAuth(true)

      try {
        await api.get('/auth/validate')
      } catch (err) {
        logout()
        navigate('/login', { replace: true })
      } finally {
        if (mounted) setCheckingAuth(false)
      }
    }

    validateToken()

    return () => {
      mounted = false
    }
  }, [token, logout, navigate])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute checkingAuth={checkingAuth}><Layout /></PrivateRoute>}>
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