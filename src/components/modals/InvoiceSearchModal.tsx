'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { omr, pct, fmt } from '@/lib/aggregations'
import styles from './Modal.module.css'

export default function InvoiceSearchModal() {
  const { months, activeMonth, modalPayload } = useDashboardStore()
  const selectedBill = modalPayload || ''
  
  const data = months[activeMonth]
  
  const invoiceLines = useMemo(() => {
    if (!data || !selectedBill) return []
    return data.items.filter(item => item.bill === selectedBill)
  }, [data, selectedBill])

  if (!data || invoiceLines.length === 0) {
    return <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Invoice details not found.</p>
  }

  // Common invoice header details (taken from the first line item)
  const firstLine = invoiceLines[0]
  const custName = firstLine.cust
  const date = firstLine.date

  // Compute invoice totals
  const totRev = invoiceLines.reduce((s, l) => s + l.tot, 0)
  const totMarg = invoiceLines.reduce((s, l) => s + l.marg, 0)
  const mPct = totRev ? (totMarg / totRev) * 100 : 0

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {/* KPI blocks matching existing modal designs */}
        <div className={styles.kpi}>
          <div className={styles.kpiL}>Customer</div>
          <div className={styles.kpiV} style={{ fontSize: 14, wordBreak: 'break-all' }}>{custName}</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiL}>Invoice Date</div>
          <div className={styles.kpiV} style={{ fontSize: 14 }}>{date || '—'}</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiL}>Invoice Margin</div>
          <div className={styles.kpiV} style={{ color: mPct >= 35 ? 'var(--green)' : 'var(--amber)' }}>{pct(mPct)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        <div className={styles.kpi}>
          <div className={styles.kpiL}>Total Revenue</div>
          <div className={styles.kpiV}>{omr(totRev)}</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiL}>Total profit margin</div>
          <div className={styles.kpiV}>{omr(totMarg)}</div>
        </div>
      </div>

      <div className={styles.sectionLabel}>Line Items ({invoiceLines.length})</div>
      <div className={styles.tw}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--surface)' }}>
              {['Part Number / Description', 'Qty', 'Unit Price', 'Revenue', 'Margin %'].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoiceLines.map((l, i) => {
              const lm = l.tot ? (l.marg / l.tot) * 100 : 0
              const unitPrice = l.unitPrice || (l.qty ? l.tot / l.qty : 0)
              const partName = l.partNo ? `${l.partNo} — ${l.item}` : l.item
              return (
                <tr key={i}>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {partName}
                  </td>
                  <td className="mono" style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>
                    {fmt(l.qty)}
                  </td>
                  <td className="mono" style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>
                    {omr(unitPrice)}
                  </td>
                  <td className="mono" style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)', color: 'var(--text-secondary)' }}>
                    {omr(l.tot)}
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-2)' }}>
                    <span className={`badge badge-${lm >= 50 ? 'green' : lm >= 25 ? 'amber' : 'red'}`}>
                      {pct(lm)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
