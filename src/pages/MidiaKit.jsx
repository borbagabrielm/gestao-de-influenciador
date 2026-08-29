import { Link } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'

export default function MidiaKitPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="font-title font-bold text-sm tracking-wide" style={{ color: 'var(--text)' }}>
          nico noal
        </Link>
        <ThemeToggle inline />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-24">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl" style={{ background: 'var(--accent-dk)' }}>
          📄
        </div>
        <h1 className="font-title font-black text-3xl mb-3" style={{ color: 'var(--text)' }}>
          Mídia Kit em construção
        </h1>
        <p className="max-w-sm text-sm mb-8" style={{ color: 'var(--text2)' }}>
          Essa página está sendo preparada. Em breve você vai encontrar aqui todos os dados e números para propostas de parceria.
        </p>
        <Link to="/" className="btn-ghost">← Voltar para a home</Link>
      </div>
    </div>
  )
}
