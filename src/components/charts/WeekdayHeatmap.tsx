'use client'
import { computeWeekdayMap } from '@/lib/aggregations'
import { fmt } from '@/lib/aggregations'
import styles from './WeekdayHeatmap.module.css'
import type { SalesItem } from '@/lib/types'
export default function WeekdayHeatmap({ items }: { items: SalesItem[] }) {
  const { revMap, cntMap } = computeWeekdayMap(items)
  const vals = Object.values(revMap); const maxV = Math.max(...vals) || 1
  return (
    <div className={styles.grid}>
      {Object.entries(revMap).map(([day, rev]) => {
        const a = rev / maxV; const isMax = rev === maxV
        return (
          <div key={day} className={styles.cell}
            style={{ background: `rgba(79,70,229,${(a * .18 + .04).toFixed(2)})`, border: `1.5px solid rgba(79,70,229,${(a * .3 + .06).toFixed(2)})` }}>
            <div className={styles.day} style={{ color: isMax ? 'var(--accent)' : undefined, fontWeight: isMax ? 700 : 600 }}>{day}</div>
            <div className={styles.val} style={{ color: isMax ? 'var(--accent)' : 'var(--text-primary)' }}>{rev > 0 ? fmt(rev) : '—'}</div>
            <div className={styles.cnt}>{cntMap[day]}</div>
          </div>
        )
      })}
    </div>
  )
}