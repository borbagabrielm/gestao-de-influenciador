import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import LoginPage     from '@/pages/Login'
import HomePage      from '@/pages/Home'
import ParceriasPage from '@/pages/parcerias'
import FinanceiroPage from '@/pages/financeiro'
import ConteudoPage  from '@/pages/conteudo'
import MetricasPage from '@/pages/metricas'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--border2)', borderTopColor: 'var(--accent)' }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/"            element={<PrivateRoute><HomePage /></PrivateRoute>} />
              <Route path="/parcerias/*" element={<PrivateRoute><ParceriasPage /></PrivateRoute>} />
              <Route path="/financeiro/*" element={<PrivateRoute><FinanceiroPage /></PrivateRoute>} />
              <Route path="/conteudo/*"  element={<PrivateRoute><ConteudoPage /></PrivateRoute>} />
              <Route path="*"           element={<Navigate to="/" replace />} />
              <Route path="/metricas/*" element={<PrivateRoute><MetricasPage /></PrivateRoute>} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}