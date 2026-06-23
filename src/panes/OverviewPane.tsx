'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems } from '@/lib/aggregations'
import KpiGrid from '@/components/overview/KpiGrid'
import SparkRow from '@/components/overview/SparkRow'
import Card from '@/components/ui/Card'
import CardHeader from '@/components/ui/CardHeader'
import Badge from '@/components/ui/Badge'
import DailyRevenueChart from '@/components/charts/DailyRevenueChart'
import CustomerBarChart from '@/components/charts/CustomerBarChart'
import { aggregateCustomers, aggregateParts } from '@/lib/aggregations'
import styles from './Pane.module.css'

export default function OverviewPane() {
  const { months, activeMonth, dateRange, crossFilter, openModal, setCrossFilter } = useDashboardStore()
  const data = months[activeMonth]
  const items = useMemo(() => data ? getFilteredItems(data, dateRange, crossFilter) : [], [data, dateRange, crossFilter])
  const custs = useMemo(() => aggregateCustomers(items).slice(0,10).map(c=>({ name:c.name.substring(0,16), value:Math.round(c.rev) })), [items])
  const parts = useMemo(() => aggregateParts(items).slice(0,10).map(p=>({ name:p.name.substring(0,16), value:Math.round(p.rev) })), [items])

  if (!data) return null
  return (
    <div className={styles.pane}>
      <KpiGrid />
      <SparkRow />
      <div className={`${styles.g2} ${styles.g1}`}>
        <Card clickable onClick={() => openModal('daily-rev')} className={styles.full}>
          <CardHeader title="Daily Revenue & Margin" subtitle="Click to drill down" badge={<Badge variant="indigo">Month view</Badge>} />
          <div style={{ padding: '16px 20px' }}><DailyRevenueChart items={items} height={200} /></div>
        </Card>
        <Card clickable onClick={() => openModal('top-custs')}>
          <CardHeader title="Top Customers" subtitle="By revenue · click any bar to filter" badge={<Badge variant="amber">Revenue</Badge>} />
          <div style={{ padding: '16px 20px' }}>
            <CustomerBarChart data={custs} onBarClick={name => setCrossFilter({ type:'customer', value:name })} activeFilter={crossFilter.type==='customer'?crossFilter.value:null} />
          </div>
        </Card>
        <Card clickable onClick={() => openModal('top-parts')}>
          <CardHeader title="Top Parts" subtitle="By revenue · click any bar to filter" badge={<Badge variant="purple">Parts</Badge>} />
          <div style={{ padding: '16px 20px' }}>
            <CustomerBarChart data={parts} onBarClick={name => setCrossFilter({ type:'part', value:name })} activeFilter={crossFilter.type==='part'?crossFilter.value:null} />
          </div>
        </Card>
      </div>
    </div>
  )
}