export default function HorizontalBarChart({
  items, barColor, trackColor = 'rgba(128,128,128,0.15)',
  labelColor = 'currentColor', valueColor = labelColor, height = 10, gap = 14,
  radius = 999, fontFamily, valueFontFamily,
}) {
  const max = Math.max(...items.map(i => i.value), 0.0001)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, fontFamily }}>
      {items.map(item => (
        <div key={item.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 5, fontSize: '0.78rem' }}>
            <span style={{ color: labelColor }}>{item.label}</span>
            <span style={{ color: valueColor, fontWeight: 800, fontVariantNumeric: 'tabular-nums', flexShrink: 0, fontFamily: valueFontFamily, fontSize: '0.95rem' }}>
              {item.value.toFixed(1)}%
            </span>
          </div>
          <div style={{ height, borderRadius: radius, background: trackColor, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.max((item.value / max) * 100, 2)}%`, background: barColor, borderRadius: radius }} />
          </div>
        </div>
      ))}
    </div>
  )
}
