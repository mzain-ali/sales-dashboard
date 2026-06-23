'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, omr, pct } from '@/lib/aggregations'
import MarginDonut from '@/components/charts/MarginDonut'
import styles from './Modal.module.css'
export default function MarginSplitModal() {
  const { months, activeMonth, dateRange, crossFilter } = useDashboardStore()
  const data = months[activeMonth]
  const items = useMemo(() => data ? getFilteredItems(data, dateRange, crossFilter) : [], [data, dateRange, crossFilter])
  const totRev = items.reduce((s,r)=>s+r.tot,0), totMarg = items.reduce((s,r)=>s+r.marg,0), totCOGS = items.reduce((s,r)=>s+r.cogs,0), totVAT = items.reduce((s,r)=>s+r.vat,0)
  const mPct = totRev ? totMarg/totRev*100 : 0
  return (
    <>
      <div className={styles.kpiRow}>
        <div className={styles.kpi}><div className={styles.kpiL}>Gross Margin</div><div className={styles.kpiV} style={{color:'var(--green)'}}>{pct(mPct)}</div></div>
        <div className={styles.kpi}><div className={styles.kpiL}>Total Margin</div><div className={styles.kpiV}>{omr(totMarg)}</div></div>
        <div className={styles.kpi}><div className={styles.kpiL}>VAT Collected</div><div className={styles.kpiV}>{omr(totVAT)}</div></div>
      </div>
      <div className={styles.ch}><MarginDonut margin={totMarg} cogs={totCOGS} vat={totVAT} height={240} /></div>
    </>
  )
}