import { useEffect, useState } from 'react'
import Modal, { FormRow, FormGrid } from '@/components/Modal'
import { RESPONSAVEIS } from '@/lib/constants'

const EMPTY = { titulo:'', status:'planejado', data_publicacao:'', rede_social:'', formato:'', tipo_conteudo:'', responsavel:'', campanha:'', tags:[], link:'', legenda:'', observacoes:'' }

export default function CnModal({ open, onClose, onSave, onDelete, onDuplicate, initial }) {
  const [form,   setForm]   = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial, tags: initial.tags||[] } : EMPTY)
      setErrors({})
    }
  }, [open, initial])

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})) }
  const toggleTag = t => setForm(f=>({ ...f, tags: f.tags.includes(t)?f.tags.filter(x=>x!==t):[...f.tags,t] }))

  const handleSave = async () => {
    const errs = {}
    if (!form.titulo.trim()) errs.titulo = 'Obrigatório'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    await onSave({
      ...form,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : form.tags,
    })
    setSaving(false)
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? (initial.titulo||'Editar conteúdo') : 'Novo conteúdo'} wide>
      <FormRow label="Título">
        <input className={`form-input${errors.titulo?' border-[var(--coral)]':''}`} value={form.titulo} onChange={e=>set('titulo',e.target.value)} placeholder="Ex: Rotina matinal — Reels" />
        {errors.titulo && <p className="text-xs mt-1" style={{ color:'var(--coral)' }}>{errors.titulo}</p>}
      </FormRow>

      <FormGrid>
        <FormRow label="Status">
          <select className="form-input" style={{ appearance:'none' }} value={form.status} onChange={e=>set('status',e.target.value)}>
            <option value="backlog">💡 Backlog</option>
            <option value="planejado">📋 Planejado</option>
            <option value="gravado">🎬 Gravado</option>
            <option value="editado">✂️ Editado</option>
            <option value="publicado">✅ Publicado</option>
            <option value="arquivado">🗄️ Arquivado</option>
          </select>
        </FormRow>
        <FormRow label="Data de publicação">
          <input className="form-input" type="date" value={form.data_publicacao} onChange={e=>set('data_publicacao',e.target.value)} />
        </FormRow>
      </FormGrid>

      <FormGrid>
        <FormRow label="Rede Social">
          <select className="form-input" style={{ appearance:'none' }} value={form.rede_social} onChange={e=>set('rede_social',e.target.value)}>
            <option value="">— Selecione —</option>
            <option value="instagram">📸 Instagram</option>
            <option value="tiktok">🎵 TikTok</option>
            <option value="youtube">▶️ YouTube</option>
          </select>
        </FormRow>
        <FormRow label="Formato">
          <select className="form-input" style={{ appearance:'none' }} value={form.formato} onChange={e=>set('formato',e.target.value)}>
            <option value="">— Selecione —</option>
            <option value="video">🎥 Vídeo</option>
            <option value="estatico">🖼️ Estático</option>
            <option value="carrossel">📑 Carrossel</option>
          </select>
        </FormRow>
      </FormGrid>

      <FormGrid>
        <FormRow label="Tipo de conteúdo">
          <select className="form-input" style={{ appearance:'none' }} value={form.tipo_conteudo} onChange={e=>set('tipo_conteudo',e.target.value)}>
            <option value="">— Selecione —</option>
            <option value="organico">🌱 Orgânico</option>
            <option value="criativo">🎨 Criativo</option>
            <option value="trend">🔥 Trend</option>
            <option value="publicidade">📢 Publicidade</option>
            <option value="parceria">🤝 Parceria</option>
          </select>
        </FormRow>
        <FormRow label="Responsável">
          <select className="form-input" style={{ appearance:'none' }} value={form.responsavel} onChange={e=>set('responsavel',e.target.value)}>
            <option value="">— Selecione —</option>
            {Object.keys(RESPONSAVEIS).map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </FormRow>
      </FormGrid>

      <FormGrid>
        <FormRow label="Campanha / Série">
          <input className="form-input" value={form.campanha} onChange={e=>set('campanha',e.target.value)} placeholder="Ex: Campanha Verão 2025" />
        </FormRow>
        <FormRow label="Tags (separadas por vírgula)">
          <input className="form-input" value={Array.isArray(form.tags)?form.tags.join(', '):form.tags} onChange={e=>set('tags',e.target.value)} placeholder="bastidores, rotina" />
        </FormRow>
      </FormGrid>

      <FormRow label="Link do conteúdo">
        <input className="form-input" value={form.link} onChange={e=>set('link',e.target.value)} placeholder="https://..." />
      </FormRow>

      <FormRow label="Legenda / Caption">
        <textarea className="form-input resize-y" rows={2} value={form.legenda} onChange={e=>set('legenda',e.target.value)} placeholder="Escreva a legenda do post..." />
      </FormRow>

      <FormRow label="Observações e referências">
        <textarea className="form-input resize-y" rows={3} value={form.observacoes} onChange={e=>set('observacoes',e.target.value)} />
      </FormRow>

      <div className="flex gap-2.5 mt-6 items-center">
        {onDelete    && <button className="btn-danger" onClick={onDelete}>Excluir</button>}
        {onDuplicate && <button className="btn-ghost text-xs" onClick={onDuplicate}>Duplicar</button>}
        <div className="flex-1" />
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={saving} onClick={handleSave}>{saving?'Salvando...':'Salvar'}</button>
      </div>
    </Modal>
  )
}