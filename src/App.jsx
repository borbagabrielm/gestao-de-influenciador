import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import LandingPage    from '@/pages/Landing'
import MidiaKitPage   from '@/pages/MidiaKit'
import LoginPage     from '@/pages/Login'
import HomePage      from '@/pages/Home'
import ParceriasPage from '@/pages/parcerias'
import FinanceiroPage from '@/pages/financeiro'
import ConteudoPage  from '@/pages/conteudo'
import MetricasPage from '@/pages/metricas'
import LandingPagesPage from '@/pages/landingPages'

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
  return user ? <Navigate to="/painel" replace /> : children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"          element={<LandingPage />} />
              <Route path="/midia-kit" element={<MidiaKitPage />} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

              <Route path="/painel"              element={<PrivateRoute><HomePage /></PrivateRoute>} />
              <Route path="/painel/parcerias/*"  element={<PrivateRoute><ParceriasPage /></PrivateRoute>} />
              <Route path="/painel/financeiro/*" element={<PrivateRoute><FinanceiroPage /></PrivateRoute>} />
              <Route path="/painel/conteudo/*"   element={<PrivateRoute><ConteudoPage /></PrivateRoute>} />
              <Route path="/painel/metricas/*"   element={<PrivateRoute><MetricasPage /></PrivateRoute>} />
              <Route path="/painel/landing-pages/*" element={<PrivateRoute><LandingPagesPage /></PrivateRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}