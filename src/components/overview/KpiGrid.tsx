'use client'
import { useMemo } from 'react'
import KpiCard from './KpiCard'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, computeKPIs, aggregateCustomers } from '@/lib/aggregations'
import { omr, pct, fmt } from '@/lib/aggregations'
import styles from './KpiGrid.module.css'

export default function KpiGrid() {
  const { months, activeMonth, dateRange, crossFilter, openModal } = useDashboardStore()
  const data = months[activeMonth]

  const kpis = useMemo(() => {
    if (!data) return null
    const items = getFilteredItems(data, dateRange, crossFilter)
    const invs = items.reduce((m, i) => { if (!m[i.bill]) m[i.bill] = { bill: i.bill, rev: 0, marg: 0, items: 0 }; m[i.bill].rev += i.tot; m[i.bill].marg += i.marg; m[i.bill].items++; return m }, {} as Record<string, any>)
    const invoices = Object.values(invs)
    const k = computeKPIs(items, invoices)
    const custs = aggregateCustomers(items)
    const top = custs[0]
    const conc = k.totRev && top ? top.rev / k.totRev * 100 : 0
    return { ...k, conc, topName: top?.name || '—' }
  }, [data, dateRange, crossFilter])

  if (!kpis) return null

  return (
    <div className={styles.grid}>
      <KpiCard label="Total Revenue" value={omr(kpis.totRev)} sub={`${fmt(kpis.totInv)} invoices`} arc={Math.min(kpis.totRev / 100000 * 100, 100)} color="#4F46E5" onClick={() => openModal('daily-rev')} />
      <KpiCard label="Gross Margin" value={pct(kpis.mPct)} sub={`${omr(kpis.totMarg)} kept`} arc={kpis.mPct} color="#10B981" chip={{ text: kpis.mPct > 35 ? 'Healthy' : 'Below target', variant: kpis.mPct > 35 ? 'green' : 'amber' }} onClick={() => openModal('marg-split')} />
      <KpiCard label="Total Invoices" value={fmt(kpis.totInv)} sub={`${fmt(data.uCusts)} customers`} arc={Math.min(kpis.totInv / 800 * 100, 100)} color="#F59E0B" onClick={() => openModal('top-custs')} />
      <KpiCard label="Avg Order Value" value={omr(kpis.aov)} sub="per invoice" arc={Math.min(kpis.aov / 500 * 100, 100)} color="#7C3AED" onClick={() => openModal('inv-dist')} />
      <KpiCard label="VAT Collected" value={omr(kpis.totVAT)} sub="5% on all sales" arc={Math.min(kpis.totVAT / 5000 * 100, 100)} color="#0EA5E9" onClick={() => openModal('marg-split')} />
    </div>
  )
}