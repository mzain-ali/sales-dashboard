'use client'
import { motion } from 'motion/react'
import { useDashboardStore } from '@/store/dashboardStore'
import styles from './TabNav.module.css'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
  { id: 'revenue', label: 'Revenue', icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
  { id: 'customers', label: 'Customers', icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>' },
  { id: 'parts', label: 'Parts', icon: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>' },
  { id: 'margin', label: 'Margin', icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' },
  { id: 'compare', label: 'Compare', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>', badge: true },
  { id: 'alerts', label: 'Alerts', icon: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', alertBadge: true },
]

export default function TabNav({ alertCount, monthCount }: { alertCount: number; monthCount: number }) {
  const { activeTab, setActiveTab } = useDashboardStore()
  return (
    <nav className={styles.nav}>
      {TABS.map(tab => (
        <button key={tab.id} className={[styles.tab, activeTab === tab.id ? styles.active : ''].join(' ')} onClick={() => setActiveTab(tab.id)}>
          <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: tab.icon }} />
          {tab.label}
          {tab.badge && monthCount >= 2 && <span className={styles.badge}>{monthCount}</span>}
          {tab.alertBadge && alertCount > 0 && <span className={[styles.badge, styles.red].join(' ')}>{alertCount}</span>}
          {activeTab === tab.id && <motion.div className={styles.underline} layoutId="tab-underline" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
        </button>
      ))}
    </nav>
  )
}