'use client'
import { motion, AnimatePresence } from 'motion/react'
import { useDashboardStore } from '@/store/dashboardStore'
export default function CrossFilterPill() {
  const { crossFilter, clearCrossFilter } = useDashboardStore()
  return (
    <AnimatePresence>
      {crossFilter.value && (
        <motion.div
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, cursor: 'pointer', userSelect: 'none' }}
          onClick={clearCrossFilter}>
          Filtering: {crossFilter.type} = {crossFilter.value} ✕
        </motion.div>
      )}
    </AnimatePresence>
  )
}