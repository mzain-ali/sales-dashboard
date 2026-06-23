import { mColor, mClass, pct } from '@/lib/aggregations'
interface MarginBarProps { value: number; maxWidth?: number }
export default function MarginBar({ value, maxWidth = 80 }: MarginBarProps) {
  const col = mColor(value)
  const cls = mClass(value)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 110 }}>
      <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', maxWidth }}>
        <div style={{ height: '100%', width: `${Math.min(Math.max(value, 0), 100)}%`, background: col, borderRadius: 3, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <span className={`badge badge-${cls}`} style={{ minWidth: 46, justifyContent: 'center' }}>{pct(value)}</span>
    </div>
  )
}