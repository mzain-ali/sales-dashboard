'use client'
import { useDashboardStore } from '@/store/dashboardStore'
import styles from './DateRangeFilter.module.css'
export default function DateRangeFilter() {
  const { dateRange, setDateRange, resetDateRange } = useDashboardStore()
  const isFiltered = dateRange.startDay !== 1 || dateRange.endDay !== 31
  return (
    <div className={`${styles.bar} no-print`}>
      <span className={styles.label}>Date range:</span>
      <div className={styles.sliders}>
        <span className={styles.val}>Day {dateRange.startDay}</span>
        <input className={styles.slider} type="range" min={1} max={31} value={dateRange.startDay} onChange={e => setDateRange({ startDay: parseInt(e.target.value), endDay: Math.max(parseInt(e.target.value), dateRange.endDay) })} />
        <input className={styles.slider} type="range" min={1} max={31} value={dateRange.endDay} onChange={e => setDateRange({ startDay: Math.min(dateRange.startDay, parseInt(e.target.value)), endDay: parseInt(e.target.value) })} />
        <span className={styles.val}>Day {dateRange.endDay}</span>
      </div>
      {isFiltered && <button className={styles.reset} onClick={resetDateRange}>Reset to full month</button>}
    </div>
  )
}