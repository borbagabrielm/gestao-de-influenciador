import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle({ inline }) {
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all"
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border2)',
        cursor: 'pointer',
        width: inline ? 'fit-content' : '100%',
        justifyContent: 'center',
      }}
    >
      {/* Track */}
      <div className="relative flex-shrink-0" style={{ width: 36, height: 20 }}>
        <div className="w-full h-full rounded-full transition-colors" style={{ background: isLight ? 'var(--accent-dk)' : 'var(--bg4)' }} />
        <div
          className="absolute top-[3px] w-[14px] h-[14px] rounded-full transition-all"
          style={{
            background: isLight ? 'var(--accent)' : 'var(--text3)',
            left: isLight ? 19 : 3,
          }}
        />
      </div>
      <span className="text-[11px]" style={{ color: 'var(--text2)' }}>
        {isLight ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}