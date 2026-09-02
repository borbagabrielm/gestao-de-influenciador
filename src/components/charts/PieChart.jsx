export default function PieChart({
  items, size = 140, labelColor = 'currentColor', valueColor = labelColor,
  swatchShape = 'circle', fontFamily, valueFontFamily,
}) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1
  let acc = 0
  const stops = items.map(item => {
    const start = (acc / total) * 360
    acc += item.value
    const end = (acc / total) * 360
    return `${item.color} ${start}deg ${end}deg`
  }).join(', ')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', fontFamily }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${stops})`, flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 10, height: 10, flexShrink: 0, background: item.color,
              borderRadius: swatchShape === 'circle' ? '50%' : 0,
            }} />
            <span style={{ fontSize: '0.8rem', color: labelColor }}>{item.label}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, marginLeft: 18, fontVariantNumeric: 'tabular-nums', color: valueColor, fontFamily: valueFontFamily }}>
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
