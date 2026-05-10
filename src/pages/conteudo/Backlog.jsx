import { RsTag, TipoTag } from './shared'

export default function CnBacklog({ conteudos, onEdit }) {
  const list = conteudos.filter(c=>c.status==='backlog')

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="font-title font-bold text-base">💡 Banco de Ideias</span>
        <span className="text-sm" style={{ color:'var(--text3)' }}>{list.length} ideias</span>
      </div>
      {list.length===0
        ? <div className="text-center py-16 text-sm" style={{ color:'var(--text3)' }}>Nenhuma ideia. Clique em "+ Novo conteúdo" para adicionar!</div>
        : (
          <div className="grid gap-3" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))' }}>
            {list.map(c=>(
              <div key={c.id} onClick={()=>onEdit(c.id)}
                className="rounded-xl p-4 cursor-pointer transition-all"
                style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform=''}}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-lg">💡</span>
                  <span className="text-sm font-medium flex-1 truncate">{c.titulo||'Sem título'}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2.5">
                  <RsTag rs={c.rede_social} />
                  <TipoTag tipo={c.tipo_conteudo} />
                </div>
                {c.observacoes&&(
                  <div className="text-xs leading-relaxed pt-2.5" style={{ color:'var(--text3)', borderTop:'1px solid var(--border)' }}>
                    {c.observacoes.slice(0,80)}{c.observacoes.length>80?'...':''}
                  </div>
                )}
                {c.campanha&&(
                  <div className="mt-2 text-[10px] px-2 py-0.5 rounded-md inline-block" style={{ background:'var(--accent-dk)',color:'var(--accent)' }}>
                    📁 {c.campanha}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}