'use client'
import { useState, useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { aggregateInvoices, getFilteredItems, omr, pct } from '@/lib/aggregations'
import MarginBar from '@/components/ui/MarginBar'
import styles from './DataTable.module.css'
import type { InvoiceData } from '@/lib/types'

export default function InvoiceTable() {
  const { months, activeMonth, dateRange, crossFilter, openModal } = useDashboardStore()
  const data = months[activeMonth]
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('rev')
  const [limit, setLimit] = useState('all')

  const rows = useMemo(() => {
    if (!data) return []
    const items = getFilteredItems(data, dateRange, crossFilter)
    let invoices = aggregateInvoices(items)
    
    if (q) {
      const query = q.toLowerCase()
      invoices = invoices.filter(
        inv => inv.bill.toLowerCase().includes(query) || inv.cust.toLowerCase().includes(query)
      )
    }

    invoices.sort((a, b) => {
      if (sort === 'date') {
        const da = a.date ? new Date(a.date).getTime() : 0
        const db = b.date ? new Date(b.date).getTime() : 0
        return da - db
      }
      if (sort === 'marg') {
        const ma = a.rev ? a.marg / a.rev : 0
        const mb = b.rev ? b.marg / b.rev : 0
        return mb - ma
      }
      if (sort === 'items') {
        return b.items - a.items
      }
      return b.rev - a.rev
    })

    return limit === 'all' ? invoices : invoices.slice(0, parseInt(limit))
  }, [data, dateRange, crossFilter, q, sort, limit])

  if (!data) return null

  return (
    <div>
      <div className={styles.fbar}>
        <div className={styles.swrap}>
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.sinp}
            placeholder="Search invoice or client…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <select className={styles.fsel} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="rev">Revenue ↓</option>
          <option value="date">Date ↑</option>
          <option value="marg">Margin % ↓</option>
          <option value="items">Line Items ↓</option>
        </select>
        <select className={styles.fsel} value={limit} onChange={e => setLimit(e.target.value)}>
          <option value="10">Top 10</option>
          <option value="20">Top 20</option>
          <option value="50">Top 50</option>
          <option value="all">All</option>
        </select>
      </div>
      <p className={styles.count}>
        Showing {rows.length} {q ? `of ${data.invoices.length}` : ''} invoices · click any row to drill down
      </p>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Bill Number</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Delivery Order</th>
              <th>Revenue</th>
              <th>Margin %</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((inv: InvoiceData, i) => {
              const mp = inv.rev ? (inv.marg / inv.rev) * 100 : 0
              return (
                <tr key={inv.bill} onClick={() => openModal('cust-drill', inv.cust)} style={{ cursor: 'pointer' }}>
                  <td className="mono" style={{ color: 'var(--text-subtle)' }}>{i + 1}</td>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>{inv.bill}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{inv.cust}</td>
                  <td className="mono">{inv.date || '—'}</td>
                  <td className="mono">{inv.delivOrder || '—'}</td>
                  <td className="mono">{omr(inv.rev)}</td>
                  <td>
                    <MarginBar value={mp} />
                  </td>
                  <td className="mono">{inv.items}</td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
