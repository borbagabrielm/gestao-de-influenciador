import { useEffect, useState } from 'react'
import Modal, { FormRow, FormGrid } from '@/components/Modal'
import { F_CAT_ENTRADA, F_CAT_SAIDA } from '@/lib/constants'

const EMPTY = { tipo:'entrada', desc:'', valor:'', data:'', origem:'', categoria:'', statusPgto:'confirmado', tags:[], notes:'' }
const TAGS  = ['publicidade','reels','stories','feed','equipe','fixo','variável']

export default function FinModal({ open, onClose, onSave, onDelete, initial, tipoInicial }) {
  const [form,   setForm]   = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial } : { ...EMPTY, tipo: tipoInicial, data: new Date().toISOString().split('T')[0] })
      setErrors({})
    }
  }, [open, initial, tipoInicial])

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})) }
  const toggleTag = t => setForm(f=>({ ...f, tags: f.tags.includes(t)?f.tags.filter(x=>x!==t):[...f.tags,t] }))
  const cats = form.tipo === 'entrada' ? F_CAT_ENTRADA : F_CAT_SAIDA

  const handleSave = async () => {
    const errs = {}
    if (!form.desc.trim()) errs.desc = 'Obrigatório'
    if (!form.valor || isNaN(form.valor)) errs.valor = 'Informe um valor'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    await onSave({ ...form, valor: Number(form.valor) || 0 })
    setSaving(false)
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar transação' : 'Nova transação'}>
      {/* Tipo toggle */}
      <div className="flex rounded-xl overflow-hidden mb-4" style={{ border: '1px solid var(--border2)' }}>
        {['entrada','saida'].map(t => (
          <button key={t} type="button" onClick={() => set('tipo', t)}
            className="flex-1 py-2.5 text-sm font-medium transition-colors"
            style={{
              background: form.tipo===t ? (t==='entrada'?'#0e2010':'var(--coral-bg)') : 'transparent',
              color:      form.tipo===t ? (t==='entrada'?'#4ade80':'var(--coral)') : 'var(--text3)',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>
            {t === 'entrada' ? '📥 Entrada' : '📤 Saída'}
          </button>
        ))}
      </div>

      <FormRow label="Descrição">
        <input className={`form-input${errors.desc?' border-[var(--coral)]':''}`} value={form.desc} onChange={e=>set('desc',e.target.value)} placeholder="Ex: Publicidade Nike — Reels" />
        {errors.desc && <p className="text-xs mt-1" style={{ color:'var(--coral)' }}>{errors.desc}</p>}
      </FormRow>

      <FormGrid>
        <FormRow label="Valor (R$)">
          <input className={`form-input${errors.valor?' border-[var(--coral)]':''}`} type="number" value={form.valor} onChange={e=>set('valor',e.target.value)} placeholder="0" />
          {errors.valor && <p className="text-xs mt-1" style={{ color:'var(--coral)' }}>{errors.valor}</p>}
        </FormRow>
        <FormRow label="Data">
          <input className="form-input" type="date" value={form.data} onChange={e=>set('data',e.target.value)} />
        </FormRow>
      </FormGrid>

      <FormGrid>
        <FormRow label={form.tipo==='entrada'?'Marca / Origem':'Beneficiário'}>
          <input className="form-input" value={form.origem} onChange={e=>set('origem',e.target.value)} />
        </FormRow>
        <FormRow label="Categoria">
          <select className="form-input" style={{ appearance:'none' }} value={form.categoria} onChange={e=>set('categoria',e.target.value)}>
            <option value="">— Selecione —</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormRow>
      </FormGrid>

      <FormRow label="Status pagamento">
        <select className="form-input" style={{ appearance:'none' }} value={form.statusPgto} onChange={e=>set('statusPgto',e.target.value)}>
          <option value="confirmado">Confirmado ✓</option>
          <option value="pendente">Pendente</option>
          <option value="atrasado">Atrasado ⚠</option>
          <option value="cancelado">Cancelado ✗</option>
        </select>
      </FormRow>

      <FormRow label="Tags">
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map(t => (
            <button key={t} type="button" onClick={()=>toggleTag(t)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                border: `1px solid ${form.tags.includes(t)?'var(--border2)':'var(--border)'}`,
                background: form.tags.includes(t)?'var(--bg4)':'transparent',
                color: form.tags.includes(t)?'var(--text)':'var(--text3)',
                cursor: 'pointer',
              }}>
              {t}
            </button>
          ))}
        </div>
      </FormRow>

      <FormRow label="Observações">
        <textarea className="form-input resize-y" rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} />
      </FormRow>

      <div className="flex gap-2.5 mt-6 justify-end items-center">
        {onDelete && <button className="btn-danger mr-auto" onClick={onDelete}>Excluir</button>}
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={saving} onClick={handleSave}>{saving?'Salvando...':'Salvar'}</button>
      </div>
    </Modal>
  )
}