'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { pct } from '@/lib/aggregations'
import styles from './TargetBar.module.css'
export default function TargetBar() {
  const { months, activeMonth, settings, updateSettings } = useDashboardStore()
  const data = months[activeMonth]
  const mPct = data && data.totRev ? data.totMarg / data.totRev * 100 : 0
  const results = useMemo(() => {
    if (!data) return []
    return [
      { label: 'Revenue', hit: settings.marginWarnPct && data.totRev >= (settings as any)._targetRev },
    ]
  }, [data, settings])
  const tRev = (settings as any)._targetRev || 0
  const tMarg = (settings as any)._targetMarg || 0
  const tInv = (settings as any)._targetInv || 0
  const hits = [tRev && data && data.totRev >= tRev, tMarg && mPct >= tMarg, tInv && data && data.totInv >= tInv].filter(Boolean).length
  const total = [tRev, tMarg, tInv].filter(Boolean).length
  return (
    <div className={`${styles.bar} no-print`}>
      <span>Targets:</span>
      <label className={styles.label}>Revenue OMR <input className={styles.inp} type="number" placeholder="e.g. 70000" defaultValue={tRev || ''} onChange={e => updateSettings({ _targetRev: parseFloat(e.target.value) || 0 } as any)} /></label>
      <label className={styles.label}>Margin % <input className={styles.inp} type="number" placeholder="e.g. 40" defaultValue={tMarg || ''} onChange={e => updateSettings({ _targetMarg: parseFloat(e.target.value) || 0 } as any)} /></label>
      <label className={styles.label}>Invoices <input className={styles.inp} type="number" placeholder="e.g. 800" defaultValue={tInv || ''} onChange={e => updateSettings({ _targetInv: parseFloat(e.target.value) || 0 } as any)} /></label>
      {total > 0 && data && <span className={[styles.result, hits === total ? styles.hit : styles.miss].join(' ')}>{hits}/{total} targets hit</span>}
    </div>
  )
}