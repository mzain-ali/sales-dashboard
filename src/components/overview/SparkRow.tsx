'use client'
import { useMemo } from 'react'
import SparkCard from './SparkCard'
import { useDashboardStore } from '@/store/dashboardStore'
import { getFilteredItems, aggregateCustomers, aggregateParts, aggregateDaily } from '@/lib/aggregations'
import { omr, pct, fmt } from '@/lib/aggregations'
import styles from './SparkRow.module.css'

export default function SparkRow() {
  const { months, activeMonth, dateRange, crossFilter, openModal } = useDashboardStore()
  const data = months[activeMonth]

  const sparks = useMemo(() => {
    if (!data) return null
    const items = getFilteredItems(data, dateRange, crossFilter)
    const daily = aggregateDaily(items)
    const custs = aggregateCustomers(items)
    const parts = aggregateParts(items)
    const totRev = items.reduce((s, r) => s + r.tot, 0)
    const totMarg = items.reduce((s, r) => s + r.marg, 0)
    const mPct = totRev ? totMarg / totRev * 100 : 0
    const best = daily.reduce((m, d) => d.rev > m.rev ? d : m, { rev: 0, day: 0 })
    return [
      { label: 'Best Day', value: `Day ${best.day}`, sub: omr(best.rev), data: daily.map(d => d.rev), color: '#4F46E5', modal: 'daily-rev' },
      { label: 'Top Customer', value: (custs[0]?.name || '—').substring(0, 18), sub: omr(custs[0]?.rev || 0), data: custs.slice(0, 12).map(c => c.rev), color: '#F59E0B', modal: 'top-custs' },
      { label: 'Best Part', value: (parts[0]?.name || '—').substring(0, 18), sub: omr(parts[0]?.rev || 0), data: parts.slice(0, 12).map(p => p.rev), color: '#7C3AED', modal: 'top-parts' },
      { label: 'Margin Rate', value: pct(mPct), sub: `${omr(totMarg)} profit`, data: daily.map(d => d.rev > 0 ? d.marg / d.rev * 100 : 0), color: '#10B981', modal: 'marg-split' },
    ]
  }, [data, dateRange, crossFilter])

  if (!sparks) return null
  return (
    <div className={styles.row}>
      {sparks.map((s, i) => <SparkCard key={i} label={s.label} value={s.value} sub={s.sub} data={s.data} color={s.color} onClick={() => openModal(s.modal)} />)}
    </div>
  )
}