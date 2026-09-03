import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'
import PageFormModal from './PageFormModal'

export default function LandingPagesList({ pages, createPage, duplicatePage }) {
  const nav = useNavigate()
  const toast = useToast()
  const [modal, setModal] = useState(null) // { mode: 'create' | 'duplicate', sourcePage? }

  const handleCreate = async ({ slug, name, description }) => {
    const created = await createPage({ slug, name, description })
    toast.success('✓ Página criada')
    setModal(null)
    nav(`/painel/landing-pages/${created.slug}`)
  }

  const handleDuplicate = async ({ slug, name, description }) => {
    await duplicatePage(modal.sourcePage.id, { slug, name, description })
    toast.success('✓ Página duplicada')
    setModal(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button className="btn-primary" onClick={() => setModal({ mode: 'create' })}>+ Nova página</button>
      </div>

      {!pages.length ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🖼️</div>
          <div className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Nenhuma landing page ainda</div>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>Crie a primeira usando o botão acima.</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {pages.map(p => (
            <div key={p.id} onClick={() => nav(`/painel/landing-pages/${p.slug}`)}
              className="rounded-2xl p-5 cursor-pointer transition-all duration-200"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--blue-bg)' }}>🖼️</div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: p.published ? 'var(--green-bg)' : 'var(--bg3)', color: p.published ? 'var(--green)' : 'var(--text3)' }}>
                  {p.published ? 'Publicada' : 'Rascunho'}
                </span>
              </div>
              <div className="font-title font-bold text-base mb-1" style={{ color: 'var(--text)' }}>{p.name}</div>
              <div className="text-xs mb-3" style={{ color: 'var(--text3)' }}>/{p.slug}</div>
              <div className="flex items-center justify-between">
                <a href={`/${p.slug}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                  className="text-xs" style={{ color: 'var(--accent)' }}>
                  Ver página pública ↗
                </a>
                <button className="text-xs" style={{ color: 'var(--text3)' }}
                  onClick={e => { e.stopPropagation(); setModal({ mode: 'duplicate', sourcePage: p }) }}>
                  Duplicar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <PageFormModal mode={modal.mode} sourcePage={modal.sourcePage}
          onClose={() => setModal(null)}
          onSubmit={modal.mode === 'duplicate' ? handleDuplicate : handleCreate} />
      )}
    </div>
  )
}
