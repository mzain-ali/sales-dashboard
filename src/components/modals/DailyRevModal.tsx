'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, aggregateDaily, omr, pct, fmt } from '@/lib/aggregations'
import DailyRevenueChart from '@/components/charts/DailyRevenueChart'
import MarginBar from '@/components/ui/MarginBar'
import styles from './Modal.module.css'
export default function DailyRevModal() {
  const { months, activeMonth, dateRange, crossFilter } = useDashboardStore()
  const data = months[activeMonth]
  const items = useMemo(() => data ? getFilteredItems(data, dateRange, crossFilter) : [], [data, dateRange, crossFilter])
  const daily = useMemo(() => aggregateDaily(items), [items])
  const totRev = items.reduce((s, r) => s + r.tot, 0)
  const best = daily.reduce((m, d) => d.rev > m.rev ? d : m, { rev: 0, day: 0 })
  const avg = totRev / Math.max(daily.length, 1)
  return (
    <>
      <div className={styles.kpiRow}>
        <div className={styles.kpi}><div className={styles.kpiL}>Total Revenue</div><div className={styles.kpiV}>{omr(totRev)}</div></div>
        <div className={styles.kpi}><div className={styles.kpiL}>Best Day</div><div className={styles.kpiV}>Day {best.day} · {omr(best.rev)}</div></div>
        <div className={styles.kpi}><div className={styles.kpiL}>Avg Daily</div><div className={styles.kpiV}>{omr(avg)}</div></div>
      </div>
      <div className={styles.ch}><DailyRevenueChart items={items} height={240} /></div>
      <div className={styles.tw}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead><tr style={{ background: 'var(--surface)' }}>{['Day','Revenue','Margin','COGS','Margin %','Invoices'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>)}</tr></thead>
        <tbody>{daily.map(d => { const mp = d.rev ? d.marg / d.rev * 100 : 0; return (
          <tr key={d.day}>{[`Day ${d.day}`, omr(d.rev), omr(d.marg), omr(d.cogs)].map((v, i) => <td key={i} className="mono" style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{v}</td>)}
            <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)' }}><MarginBar value={mp} /></td>
            <td className="mono" style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{d.invs.size}</td>
          </tr>) })}</tbody>
      </table></div>
    </>
  )
}