'use client'
import { useState, useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { aggregateCustomers, getFilteredItems, omr, pct, mClass } from '@/lib/aggregations'
import MarginBar from '@/components/ui/MarginBar'
import styles from './DataTable.module.css'

export default function CustomerTable() {
  const { months, activeMonth, dateRange, crossFilter, openModal, settings } = useDashboardStore()
  const data = months[activeMonth]
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('rev')
  const [limit, setLimit] = useState('all')
  const [lowOnly, setLowOnly] = useState(false)
  const [dormantOnly, setDormantOnly] = useState(false)
  const [dormantDay, setDormantDay] = useState(15)

  const rows = useMemo(() => {
    if (!data) return []
    const items = getFilteredItems(data, dateRange, crossFilter)
    let custs = aggregateCustomers(items)
    if (q) custs = custs.filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
    
    if (lowOnly) {
      const threshold = settings.lowMarginItemPct || 10
      custs = custs.filter(c => c.rev > 0 && (c.marg / c.rev * 100) < threshold)
    }

    if (dormantOnly) {
      custs = custs.filter(c => {
        if (!c.lastDate) return false
        const day = parseInt(c.lastDate.split('-')[2]) || 0
        return day < dormantDay
      })
    }

    custs.sort((a, b) => sort === 'marg' ? (b.marg / b.rev || 0) - (a.marg / a.rev || 0) : sort === 'inv' ? b.invs.size - a.invs.size : b.rev - a.rev)
    return limit === 'all' ? custs : custs.slice(0, parseInt(limit))
  }, [data, dateRange, crossFilter, q, sort, limit, lowOnly, dormantOnly, dormantDay, settings.lowMarginItemPct])

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
        
        <button className={[styles.fbtn, lowOnly ? styles.fbtnOn : ''].join(' ')} onClick={() => setLowOnly(!lowOnly)}>
          <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Low margin only
        </button>

        <button className={[styles.fbtn, dormantOnly ? styles.fbtnOn : ''].join(' ')} onClick={() => setDormantOnly(!dormantOnly)}>
          <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Dormant only
        </button>
        {dormantOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>Before day:</span>
            <input
              type="number"
              min="1"
              max="31"
              value={dormantDay}
              onChange={e => setDormantDay(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
              style={{
                width: 44,
                padding: '2px 4px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: 11,
                textAlign: 'center',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>
      <p className={styles.count}>Showing {rows.length} {q ? `of ${Object.keys(data?.custs || {}).length}` : ''} customers · click any row to drill down</p>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead><tr><th>#</th><th>Customer</th><th>Revenue</th><th>Margin</th><th>Margin %</th><th>Invoices</th><th>Avg Invoice</th><th>Last Order</th></tr></thead>
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
                  <td className="mono" style={{ color: 'var(--text-secondary)' }}>{c.lastDate || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}