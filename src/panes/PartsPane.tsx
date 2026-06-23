'use client'
import { useMemo, useRef } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, aggregateParts } from '@/lib/aggregations'
import Card from '@/components/ui/Card'
import CardHeader from '@/components/ui/CardHeader'
import Badge from '@/components/ui/Badge'
import CustomerBarChart from '@/components/charts/CustomerBarChart'
import PartsTable from '@/components/tables/PartsTable'
import { useReveal } from '@/hooks/useReveal'
import styles from './Pane.module.css'

export default function PartsPane() {
  const { months, activeMonth, dateRange, crossFilter, openModal, setCrossFilter } = useDashboardStore()
  const data = months[activeMonth]
  const items = useMemo(() => data ? getFilteredItems(data, dateRange, crossFilter) : [], [data, dateRange, crossFilter])
  const parts = useMemo(() => aggregateParts(items), [items])
  const chartRev = parts.slice(0,15).map(p=>({ name:p.name.substring(0,16), value:Math.round(p.rev) }))
  const chartMarg = [...parts].filter(p=>p.rev>100).map(p=>({ name:p.name.substring(0,16), value:+(p.marg/p.rev*100).toFixed(1) })).sort((a,b)=>b.value-a.value).slice(0,15)

  const containerRef = useRef<HTMLDivElement>(null)
  useReveal(containerRef)

  if (!data) return null
  return (
    <div ref={containerRef} className={styles.pane}>
      <div className={styles.g2}>
        <Card clickable onClick={() => openModal('top-parts')}><CardHeader title="Parts by Revenue" subtitle="Top 15 sellers · click bars to cross-filter" badge={<Badge variant="purple">Revenue</Badge>} /><div style={{padding:'16px 20px'}}><CustomerBarChart data={chartRev} height={260} onBarClick={name=>setCrossFilter({type:'part',value:name})} activeFilter={crossFilter.type==='part'?crossFilter.value:null} /></div></Card>
        <Card clickable onClick={() => openModal('parts-marg')}><CardHeader title="Parts by Margin %" subtitle="Most profitable items" badge={<Badge variant="green">Profitability</Badge>} /><div style={{padding:'16px 20px'}}><CustomerBarChart data={chartMarg} isMargin height={260} /></div></Card>
      </div>
      <div className={styles.g1}><Card><CardHeader title="All Parts" subtitle={`${data.uParts} unique parts · filter, sort, search`} badge={<Badge>Full list</Badge>} /><PartsTable /></Card></div>
    </div>
  )
}