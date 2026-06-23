'use client'
import { useState, useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { aggregateCustomers, getFilteredItems, omr, pct, mClass } from '@/lib/aggregations'
import MarginBar from '@/components/ui/MarginBar'
import styles from './DataTable.module.css'

export default function CustomerTable() {
  const { months, activeMonth, dateRange, crossFilter, openModal } = useDashboardStore()
  const data = months[activeMonth]
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('rev')
  const [limit, setLimit] = useState('all')

  const rows = useMemo(() => {
    if (!data) return []
    const items = getFilteredItems(data, dateRange, crossFilter)
    let custs = aggregateCustomers(items)
    if (q) custs = custs.filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
    custs.sort((a, b) => sort === 'marg' ? (b.marg / b.rev || 0) - (a.marg / a.rev || 0) : sort === 'inv' ? b.invs.size - a.invs.size : b.rev - a.rev)
    return limit === 'all' ? custs : custs.slice(0, parseInt(limit))
  }, [data, dateRange, crossFilter, q, sort, limit])

  return (
    <div>
      <div className={styles.fbar}>
        <div className={styles.swrap}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className={styles.sinp} placeholder="Search customer…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select className={styles.fsel} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="rev">Revenue ↓</option><option value="marg">Margin % ↓</option><option value="inv">Invoices ↓</option>
        </select>
        <select className={styles.fsel} value={limit} onChange={e => setLimit(e.target.value)}>
          <option value="10">Top 10</option><option value="20">Top 20</option><option value="50">Top 50</option><option value="all">All</option>
        </select>
      </div>
      <p className={styles.count}>Showing {rows.length} {q ? `of ${Object.keys(data?.custs || {}).length}` : ''} customers · click any row to drill down</p>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead><tr><th>#</th><th>Customer</th><th>Revenue</th><th>Margin</th><th>Margin %</th><th>Invoices</th><th>Avg Invoice</th></tr></thead>
          <tbody>
            {rows.map((c, i) => {
              const mp = c.rev ? c.marg / c.rev * 100 : 0
              const ai = c.invs.size ? c.rev / c.invs.size : 0
              return (
                <tr key={c.name} onClick={() => openModal('cust-drill', c.name)}>
                  <td className="mono" style={{ color: 'var(--text-subtle)' }}>{i + 1}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</td>
                  <td className="mono">{omr(c.rev)}</td>
                  <td className="mono">{omr(c.marg)}</td>
                  <td><MarginBar value={mp} /></td>
                  <td className="mono">{c.invs.size}</td>
                  <td className="mono">{omr(ai)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}