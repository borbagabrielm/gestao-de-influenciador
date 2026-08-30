import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { useToast } from '@/contexts/ToastContext'
import { useAudienceInsights } from '@/hooks/useAudienceInsights'
import HorizontalBarChart from '@/components/charts/HorizontalBarChart'
import PieChart from '@/components/charts/PieChart'
import { AUDIENCE_TYPES } from './audienceParsers'

const BAR_COLOR = '#3987e5'
const PIE_COLORS = ['#3987e5', '#d95926']

function AudienceCard({ category, data, replaceCategory }) {
  const toast = useToast()
  const fileRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const meta = AUDIENCE_TYPES[category]

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async ({ data: rows }) => {
        try {
          const headers = Object.keys(rows[0] || {})
          if (!headers.includes(meta.headerHint)) {
            toast.error(`Planilha errada — esperava a coluna "${meta.headerHint}"`)
            setImporting(false)
            return
          }
          const parsed = meta.parser(rows)
          if (!parsed.length) {
            toast.error('Nenhum dado válido encontrado na planilha')
            setImporting(false)
            return
          }
          await replaceCategory(category, parsed)
          toast.success(`✓ ${meta.label} atualizado (${parsed.length} registros)`)
        } catch (err) {
          toast.error('Erro ao importar: ' + err.message)
        }
        setImporting(false)
        e.target.value = ''
      },
    })
  }

  const chartData = category === 'city' ? data.slice(0, 5) : data

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{meta.label}</div>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        <button className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={importing}>
          {importing ? 'Importando...' : data.length ? 'Atualizar CSV' : '+ Importar CSV'}
        </button>
      </div>

      {!data.length ? (
        <p className="text-xs" style={{ color: 'var(--text3)' }}>Nenhum dado importado ainda.</p>
      ) : category === 'gender' ? (
        <PieChart
          items={chartData.map((d, i) => ({ label: d.label, value: d.value, color: PIE_COLORS[i % PIE_COLORS.length] }))}
          labelColor="var(--text2)" valueColor="var(--text)"
        />
      ) : (
        <HorizontalBarChart
          items={chartData}
          barColor={BAR_COLOR}
          trackColor="var(--bg3)"
          labelColor="var(--text2)"
          valueColor="var(--text)"
        />
      )}
    </div>
  )
}

export default function MetricasPublico() {
  const { byCategory, replaceCategory } = useAudienceInsights()

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <div className="font-title font-bold text-lg" style={{ color: 'var(--text)' }}>Audiência</div>
        <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
          Importe as planilhas de audiência (cidade, faixa etária, gênero) exportadas do Instagram. Cada import substitui os dados anteriores dessa categoria e já reflete no mídia kit.
        </p>
      </div>

      <AudienceCard category="city" data={byCategory('city')} replaceCategory={replaceCategory} />
      <AudienceCard category="age" data={byCategory('age')} replaceCategory={replaceCategory} />
      <AudienceCard category="gender" data={byCategory('gender')} replaceCategory={replaceCategory} />
    </div>
  )
}
