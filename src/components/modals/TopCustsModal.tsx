'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, aggregateCustomers, omr, pct } from '@/lib/aggregations'
import CustomerBarChart from '@/components/charts/CustomerBarChart'
import MarginBar from '@/components/ui/MarginBar'
import styles from './Modal.module.css'

export default function TopCustsModal({ type }: { type: string }) {
  const { months, activeMonth, dateRange, crossFilter } = useDashboardStore()
  const data = months[activeMonth]
  const items = useMemo(() => data ? getFilteredItems(data, dateRange, crossFilter) : [], [data, dateRange, crossFilter])
  const custs = useMemo(() => aggregateCustomers(items), [items])
  const isMarg = type === 'cust-marg'
  const byMarg = [...custs].filter(c => c.rev > 100).map(c => ({ ...c, mPct: c.rev ? c.marg / c.rev * 100 : 0 })).sort((a, b) => b.mPct - a.mPct)
  const displayed = isMarg ? byMarg : custs
  const chartData = isMarg
    ? byMarg.slice(0, 14).map(c => ({ name: c.name.substring(0, 16), value: +((c as any).mPct || 0).toFixed(1) }))
    : custs.slice(0, 14).map(c => ({ name: c.name.substring(0, 16), value: Math.round(c.rev) }))
  const totRev = items.reduce((s, r) => s + r.tot, 0)

  return (
    <>
      <div className={styles.kpiRow}>
        <div className={styles.kpi}><div className={styles.kpiL}>Customers</div><div className={styles.kpiV}>{displayed.length}</div></div>
        <div className={styles.kpi}><div className={styles.kpiL}>Top 5 Share</div><div className={styles.kpiV}>{pct(totRev ? custs.slice(0, 5).reduce((s, c) => s + c.rev, 0) / totRev * 100 : 0)}</div></div>
        <div className={styles.kpi}><div className={styles.kpiL}>Avg Revenue</div><div className={styles.kpiV}>{omr(displayed.length ? totRev / displayed.length : 0)}</div></div>
      </div>
      <div className={styles.ch}><CustomerBarChart data={chartData} isMargin={isMarg} height={240} /></div>
      <div className={styles.tw}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--surface)' }}>
              {['#', 'Customer', 'Revenue', 'Margin', 'Margin %', 'Invoices'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.slice(0, 40).map((c, i) => {
              const mp = c.rev ? c.marg / c.rev * 100 : 0
              return (
                <tr key={c.name}>
                  <td className="mono" style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-subtle)' }}>{i + 1}</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</td>
                  <td className="mono" style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{omr(c.rev)}</td>
                  <td className="mono" style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{omr(c.marg)}</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)' }}><MarginBar value={mp} /></td>
                  <td className="mono" style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>{c.invs.size}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
