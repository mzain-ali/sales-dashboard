'use client'
import { useState, useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { aggregateParts, getFilteredItems, omr, fmt } from '@/lib/aggregations'
import MarginBar from '@/components/ui/MarginBar'
import styles from './DataTable.module.css'

export default function PartsTable() {
  const { months, activeMonth, dateRange, crossFilter } = useDashboardStore()
  const data = months[activeMonth]
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('rev')
  const [limit, setLimit] = useState('all')
  const [lowOnly, setLowOnly] = useState(false)

  const rows = useMemo(() => {
    if (!data) return []
    const items = getFilteredItems(data, dateRange, crossFilter)
    let parts = aggregateParts(items)
    if (q) parts = parts.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    if (lowOnly) parts = parts.filter(p => p.rev > 0 && p.marg / p.rev * 100 < 10)
    parts.sort((a, b) => sort === 'marg' ? (b.marg / b.rev || 0) - (a.marg / a.rev || 0) : sort === 'qty' ? b.qty - a.qty : b.rev - a.rev)
    return limit === 'all' ? parts : parts.slice(0, parseInt(limit))
  }, [data, dateRange, crossFilter, q, sort, limit, lowOnly])

  return (
    <div>
      <div className={styles.fbar}>
        <div className={styles.swrap}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className={styles.sinp} placeholder="Search part…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select className={styles.fsel} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="rev">Revenue ↓</option><option value="marg">Margin % ↓</option><option value="qty">Qty ↓</option>
        </select>
        <select className={styles.fsel} value={limit} onChange={e => setLimit(e.target.value)}>
          <option value="10">Top 10</option><option value="20">Top 20</option><option value="50">Top 50</option><option value="all">All</option>
        </select>
        <button className={[styles.fbtn, lowOnly ? styles.fbtnOn : ''].join(' ')} onClick={() => setLowOnly(!lowOnly)}>
          <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Low margin only
        </button>
      </div>
      <p className={styles.count}>Showing {rows.length} parts</p>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead><tr><th>#</th><th>Part Name</th><th>Qty Sold</th><th>Revenue</th><th>Margin</th><th>Margin %</th></tr></thead>
          <tbody>
            {rows.map((p, i) => {
              const mp = p.rev ? p.marg / p.rev * 100 : 0
              return (
                <tr key={p.name}>
                  <td className="mono" style={{ color: 'var(--text-subtle)' }}>{i + 1}</td>
                  <td>{p.name}</td>
                  <td className="mono">{fmt(p.qty)}</td>
                  <td className="mono">{omr(p.rev)}</td>
                  <td className="mono">{omr(p.marg)}</td>
                  <td><MarginBar value={mp} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}