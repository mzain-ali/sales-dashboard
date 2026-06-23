'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, aggregateInvoices, computeInvoiceBuckets, omr, pct, fmt } from '@/lib/aggregations'
import InvoiceDistChart from '@/components/charts/InvoiceDistChart'
import styles from './Modal.module.css'
export default function InvDistModal() {
  const { months, activeMonth, dateRange, crossFilter } = useDashboardStore()
  const data = months[activeMonth]
  const items = useMemo(() => data ? getFilteredItems(data, dateRange, crossFilter) : [], [data, dateRange, crossFilter])
  const invoices = useMemo(() => aggregateInvoices(items), [items])
  const buckets = computeInvoiceBuckets(invoices)
  const totRev = items.reduce((s,r)=>s+r.tot,0)
  const small = invoices.filter(i=>i.rev<50).length
  return (
    <>
      <div className={styles.kpiRow}>
        <div className={styles.kpi}><div className={styles.kpiL}>Total Invoices</div><div className={styles.kpiV}>{fmt(invoices.length)}</div></div>
        <div className={styles.kpi}><div className={styles.kpiL}>Under OMR 50</div><div className={styles.kpiV}>{fmt(small)} ({pct(invoices.length?small/invoices.length*100:0)})</div></div>
        <div className={styles.kpi}><div className={styles.kpiL}>Avg Invoice</div><div className={styles.kpiV}>{omr(invoices.length?totRev/invoices.length:0)}</div></div>
      </div>
      <div className={styles.ch}><InvoiceDistChart invoices={invoices} height={240} /></div>
      <div className={styles.tw}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
        <thead><tr style={{background:'var(--surface)'}}>{['Size','Count','% of Orders','Revenue','% of Revenue'].map(h=><th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text-muted)',borderBottom:'1px solid var(--border)'}}>{h}</th>)}</tr></thead>
        <tbody>{buckets.map(b=>(
          <tr key={b.label}><td style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)'}}>{b.label}</td>
            <td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{b.count}</td>
            <td style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)'}}><span className="badge badge-amber">{pct(invoices.length?b.count/invoices.length*100:0)}</span></td>
            <td className="mono" style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)',color:'var(--text-secondary)'}}>{omr(b.revenue)}</td>
            <td style={{padding:'8px 12px',borderBottom:'1px solid var(--surface-2)'}}><span className="badge badge-green">{pct(totRev?b.revenue/totRev*100:0)}</span></td>
          </tr>))}
        </tbody>
      </table></div>
    </>
  )
}