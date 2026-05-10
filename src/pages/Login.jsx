import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail]   = useState('')
  const [pass,  setPass]    = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async e => {
    e?.preventDefault()
    if (!email || !pass) { setError('Preencha e-mail e senha.'); return }
    setLoading(true); setError('')
    try {
      await login(email, pass)
    } catch(err) {
      setError('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm rounded-3xl p-12 text-center" style={{ background: 'var(--bg2)', border: '1px solid var(--border2)' }}>

        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 font-title font-black text-2xl text-black"
          style={{ background: 'var(--accent)' }}>GI</div>

        <h1 className="font-title font-bold text-2xl mb-1.5" style={{ color: 'var(--text)' }}>
          Gestão de Influenciador
        </h1>
        <p className="text-sm mb-7" style={{ color: 'var(--text2)' }}>Plataforma de gestão completa</p>

        <form onSubmit={handleLogin} className="space-y-2.5">
          <input
            className="form-input"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('pass-input')?.focus()}
            autoComplete="username"
          />
          <input
            id="pass-input"
            className="form-input"
            type="password"
            placeholder="Senha"
            value={pass}
            onChange={e => setPass(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="text-xs text-left pt-1" style={{ color: 'var(--coral)' }}>{error}</p>}
          <button
            type="submit"
            className="btn-primary w-full mt-1"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs mt-4" style={{ color: 'var(--text3)' }}>🔒 Acesso restrito</p>

        <div className="mt-5 flex justify-center">
          <ThemeToggle inline />
        </div>
      </div>
    </div>
  )
}