'use client'
import { useRef, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useDashboardStore } from '@/store/dashboardStore'
import { parseWorkbook } from '@/lib/parser'
import { computeAlerts } from '@/panes/AlertsPane'
import UploadScreen from './upload/UploadScreen'
import Topbar from './layout/Topbar'
import MonthsBar from './layout/MonthsBar'
import TargetBar from './layout/TargetBar'
import TabNav from './layout/TabNav'
import DateRangeFilter from './layout/DateRangeFilter'
import CrossFilterPill from './layout/CrossFilterPill'
import SettingsPanel from './settings/SettingsPanel'
import Modal from './modals/Modal'
import OverviewPane from '@/panes/OverviewPane'
import RevenuePane from '@/panes/RevenuePane'
import CustomersPane from '@/panes/CustomersPane'
import PartsPane from '@/panes/PartsPane'
import MarginPane from '@/panes/MarginPane'
import ComparePane from '@/panes/ComparePane'
import AlertsPane from '@/panes/AlertsPane'
import RepPane from '@/panes/RepPane'
import InvoicesPane from '@/panes/InvoicesPane'
import styles from './Dashboard.module.css'

const FILE_INPUT_ID = 'global-file-input'

export default function Dashboard() {
  const { months, activeMonth, activeTab, addMonth, crossFilter, dateRange, settings, theme } = useDashboardStore()
  const hasData = Object.keys(months).length > 0

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || 'light')
  }, [theme])

  const alertCount = useMemo(() => {
    if (!hasData) return 0
    return computeAlerts(months, activeMonth, dateRange, crossFilter, settings).filter(a => a.type !== 'good').length
  }, [months, activeMonth, dateRange, crossFilter, settings])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).filter(f => f.name.match(/\.(xlsx|xls)$/i))
    for (const file of files) {
      const buf = await file.arrayBuffer()
      addMonth(parseWorkbook(buf))
    }
    e.target.value = ''
  }

  const paneVariants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

  return (
    <>
      <input type="file" id={FILE_INPUT_ID} accept=".xlsx,.xls" multiple onChange={handleFileChange} style={{ display: 'none' }} />
      <UploadScreen />
      {hasData && (
        <div className={styles.app}>
          <Topbar fileInputId={FILE_INPUT_ID} />
          <TargetBar />
          <MonthsBar fileInputId={FILE_INPUT_ID} />
          <DateRangeFilter />
          <TabNav alertCount={alertCount} monthCount={Object.keys(months).length} />
          {crossFilter.value && (
            <div className={styles.filterRow}>
              <CrossFilterPill />
            </div>
          )}
          <main className={styles.content}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} variants={paneVariants} initial="hidden" animate="show" exit="hidden" transition={{ duration: .2 }}>
                {activeTab === 'overview' && <OverviewPane />}
                {activeTab === 'revenue' && <RevenuePane />}
                {activeTab === 'customers' && <CustomersPane />}
                {activeTab === 'invoices' && <InvoicesPane />}
                {activeTab === 'reps' && <RepPane />}
                {activeTab === 'parts' && <PartsPane />}
                {activeTab === 'margin' && <MarginPane />}
                {activeTab === 'compare' && <ComparePane />}
                {activeTab === 'alerts' && <AlertsPane />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      )}
      <Modal />
      <SettingsPanel />
    </>
  )
}