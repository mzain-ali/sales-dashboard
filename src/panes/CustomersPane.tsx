'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, aggregateCustomers } from '@/lib/aggregations'
import Card from '@/components/ui/Card'
import CardHeader from '@/components/ui/CardHeader'
import Badge from '@/components/ui/Badge'
import CustomerBarChart from '@/components/charts/CustomerBarChart'
import CustomerTable from '@/components/tables/CustomerTable'
import styles from './Pane.module.css'

export default function CustomersPane() {
  const { months, activeMonth, dateRange, crossFilter, openModal, setCrossFilter } = useDashboardStore()
  const data = months[activeMonth]
  const items = useMemo(() => data ? getFilteredItems(data, dateRange, crossFilter) : [], [data, dateRange, crossFilter])
  const custs = useMemo(() => aggregateCustomers(items), [items])
  const chartRev = custs.slice(0,15).map(c=>({ name:c.name.substring(0,16), value:Math.round(c.rev) }))
  const chartMarg = [...custs].filter(c=>c.rev>100).map(c=>({ name:c.name.substring(0,16), value:+(c.marg/c.rev*100).toFixed(1) })).sort((a,b)=>b.value-a.value).slice(0,15)
  if (!data) return null
  return (
    <div className={styles.pane}>
      <div className={styles.g2}>
        <Card clickable onClick={() => openModal('top-custs')}><CardHeader title="Revenue by Customer" subtitle="Top 15 · click bars to cross-filter" badge={<Badge variant="amber">Revenue</Badge>} /><div style={{padding:'16px 20px'}}><CustomerBarChart data={chartRev} height={260} onBarClick={name=>setCrossFilter({type:'customer',value:name})} activeFilter={crossFilter.type==='customer'?crossFilter.value:null} /></div></Card>
        <Card clickable onClick={() => openModal('cust-marg')}><CardHeader title="Margin % by Customer" subtitle="Most profitable accounts" badge={<Badge variant="green">Profitability</Badge>} /><div style={{padding:'16px 20px'}}><CustomerBarChart data={chartMarg} isMargin height={260} /></div></Card>
      </div>
      <div className={styles.g1}><Card><CardHeader title="All Customers" subtitle={`${data.uCusts} customers · click any row to drill down`} badge={<Badge>Full list</Badge>} /><CustomerTable /></Card></div>
    </div>
  )
}