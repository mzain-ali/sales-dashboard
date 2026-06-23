'use client'
import { motion, AnimatePresence } from 'motion/react'
import { useDashboardStore } from '@/store/dashboardStore'
import styles from './MonthsBar.module.css'
export default function MonthsBar({ fileInputId }: { fileInputId: string }) {
  const { months, activeMonth, setActiveMonth, removeMonth } = useDashboardStore()
  const names = Object.keys(months).sort()
  if (!names.length) return null
  return (
    <div className={styles.bar}>
      <span className={styles.label}>Months loaded:</span>
      <div className={styles.chips}>
        <AnimatePresence mode="popLayout">
          {names.map(m => (
            <motion.span key={m} className={[styles.chip, m === activeMonth ? styles.active : ''].join(' ')}
              onClick={() => setActiveMonth(m)}
              layout initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
              {m}
              {names.length > 1 && <span className={styles.del} onClick={e => { e.stopPropagation(); removeMonth(m) }}>✕</span>}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <label className={styles.add} htmlFor={fileInputId}><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add month</label>
    </div>
  )
}