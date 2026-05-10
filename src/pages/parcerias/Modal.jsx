import { useEffect, useState } from 'react'
import Modal, { FormRow, FormGrid, ModalActions } from '@/components/Modal'

const EMPTY = { company:'', contact:'', email:'', value:'', followup:'', notes:'', pubdate:'', pgtoDate:'', finalValue:'', tags:[], modo:null, phase:1, status:'lead', statusHistory:[] }
const TIPOS = ['publicidade','permuta','seeding','collab','embaixadora']
const MODOS = [{ v:'ativa', label:'🟢 Ativa' }, { v:'passiva', label:'🟣 Passiva' }]

export default function ParceriasModal({ open, onClose, onSave, onDelete, initial }) {
  const [form,    setForm]    = useState(EMPTY)
  const [phase,   setPhase]   = useState(1)
  const [saving,  setSaving]  = useState(false)
  const [errors,  setErrors]  = useState({})

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial } : EMPTY)
      setPhase(initial?.phase || 1)
      setErrors({})
    }
  }, [open, initial])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const toggleTag = t => setForm(f => ({
    ...f,
    tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t]
  }))

  const handleSave = async () => {
    const errs = {}
    if (!form.company.trim()) errs.company = 'Obrigatório'
    if (Object.keys(errs).length) { setErrors(errs); return }

    let statusHistory = form.statusHistory || []
    if (initial && initial.status !== form.status && !statusHistory.includes(initial.status)) {
      statusHistory = [...statusHistory, initial.status]
    }

    setSaving(true)
    await onSave({ ...form, phase, statusHistory })
    setSaving(false)
  }

  const statusOpts = {
    1: [['lead','Lead mapeado'],['contato','Em contato'],['negociacao','Em negociação'],['proposta','Proposta enviada'],['fechado','Parceria fechada ★'],['perdido','Perdido ✗']],
    2: [['producao','Em produção'],['edicao','Em edição'],['aprovacao','Aguardando aprovação'],['publicado','Publicado']],
    3: [['nf_pendente','NF pendente'],['nf_emitida','NF emitida'],['pgto_pendente','Pagamento pendente'],['recebido','Recebido ✓']],
  }

  const tabStyle = active => ({
    flex: 1, padding: '8px', background: active ? 'var(--bg2)' : 'transparent',
    border: 'none', borderRadius: 7, color: active ? 'var(--accent)' : 'var(--text3)',
    fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
  })

  return (
    <Modal open={open} onClose={onClose} title={initial ? initial.company : 'Nova prospecção'}>
      {/* Phase tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: 'var(--bg3)' }}>
        {[1,2,3].map(n => (
          <button key={n} style={tabStyle(phase === n)} onClick={() => setPhase(n)}>
            {n === 1 ? '1 · Prospecção' : n === 2 ? '2 · Produção' : '3 · Financeiro'}
          </button>
        ))}
      </div>

      {/* Phase 1 */}
      {phase === 1 && (
        <>
          <FormGrid>
            <FormRow label="Empresa / Marca">
              <input className={`form-input${errors.company ? ' border-[var(--coral)]' : ''}`} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Nike Brasil" />
              {errors.company && <p className="text-xs mt-1" style={{ color: 'var(--coral)' }}>{errors.company}</p>}
            </FormRow>
            <FormRow label="Contato">
              <input className="form-input" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Nome" />
            </FormRow>
          </FormGrid>
          <FormRow label="E-mail / WhatsApp">
            <input className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contato@empresa.com" />
          </FormRow>
          <FormGrid>
            <FormRow label="Valor estimado (R$)">
              <input className="form-input" type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="0" />
            </FormRow>
            <FormRow label="Follow-up">
              <input className="form-input" type="date" value={form.followup} onChange={e => set('followup', e.target.value)} />
            </FormRow>
          </FormGrid>
          <FormRow label="Status">
            <select className="form-input" style={{ appearance: 'none' }} value={form.status} onChange={e => set('status', e.target.value)}>
              {statusOpts[1].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormRow>
        </>
      )}

      {/* Phase 2 */}
      {phase === 2 && (
        <>
          <FormRow label="Status de produção">
            <select className="form-input" style={{ appearance: 'none' }} value={form.status} onChange={e => set('status', e.target.value)}>
              {statusOpts[2].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormRow>
          <FormRow label="Data de publicação prevista">
            <input className="form-input" type="date" value={form.pubdate} onChange={e => set('pubdate', e.target.value)} />
          </FormRow>
        </>
      )}

      {/* Phase 3 */}
      {phase === 3 && (
        <>
          <FormRow label="Status financeiro">
            <select className="form-input" style={{ appearance: 'none' }} value={form.status} onChange={e => set('status', e.target.value)}>
              {statusOpts[3].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormRow>
          <FormGrid>
            <FormRow label="Valor final (R$)">
              <input className="form-input" type="number" value={form.finalValue} onChange={e => set('finalValue', e.target.value)} placeholder="0" />
            </FormRow>
            <FormRow label="Prazo de pagamento">
              <input className="form-input" type="date" value={form.pgtoDate} onChange={e => set('pgtoDate', e.target.value)} />
            </FormRow>
          </FormGrid>
        </>
      )}

      {/* Tipo */}
      <FormRow label="Tipo de parceria">
        <div className="flex flex-wrap gap-2">
          {TIPOS.map(t => (
            <button key={t} type="button"
              onClick={() => toggleTag(t)}
              className="px-3.5 py-1.5 rounded-full text-xs transition-all"
              style={{
                border: `1px solid ${form.tags.includes(t) ? (t==='publicidade'?'var(--purple)':t==='permuta'?'var(--teal)':t==='seeding'?'var(--amber)':'var(--border2)') : 'var(--border2)'}`,
                background: form.tags.includes(t) ? (t==='publicidade'?'var(--purple-bg)':t==='permuta'?'var(--teal-bg)':t==='seeding'?'var(--amber-bg)':'var(--bg4)') : 'transparent',
                color: form.tags.includes(t) ? (t==='publicidade'?'var(--purple)':t==='permuta'?'var(--teal)':t==='seeding'?'var(--amber)':'var(--text)') : 'var(--text2)',
                cursor: 'pointer',
              }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </FormRow>

      {/* Modo */}
      <FormRow label="Modo de prospecção">
        <div className="flex gap-2">
          {MODOS.map(m => (
            <button key={m.v} type="button"
              onClick={() => set('modo', form.modo === m.v ? null : m.v)}
              className="px-3.5 py-1.5 rounded-full text-xs transition-all"
              style={{
                border: `1px solid ${form.modo === m.v ? (m.v==='ativa'?'#4ade80':'#c084fc') : 'var(--border2)'}`,
                background: form.modo === m.v ? (m.v==='ativa'?'#0e2010':'#1a0e28') : 'transparent',
                color: form.modo === m.v ? (m.v==='ativa'?'#4ade80':'#c084fc') : 'var(--text2)',
                cursor: 'pointer',
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </FormRow>

      {/* Observações */}
      <FormRow label="Observações">
        <textarea className="form-input resize-y" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Anotações, histórico..." />
      </FormRow>

      <ModalActions onClose={onClose} onDelete={initial ? onDelete : null} saving={saving} onClick={handleSave} />
      {/* ModalActions precisa do onClick passado direto */}
      <div className="hidden">
        <button onClick={handleSave} id="__save-trigger" />
      </div>
    </Modal>
  )
}