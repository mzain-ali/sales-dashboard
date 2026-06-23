'use client'
import { AnimatePresence, motion } from 'motion/react'
import { useDashboardStore } from '@/store/dashboardStore'
import { useEffect } from 'react'
import DailyRevModal from './DailyRevModal'
import TopCustsModal from './TopCustsModal'
import TopPartsModal from './TopPartsModal'
import MarginSplitModal from './MarginSplitModal'
import InvDistModal from './InvDistModal'
import CustDrillModal from './CustDrillModal'
import AnnotateModal from './AnnotateModal'
import InvoiceSearchModal from './InvoiceSearchModal'
import styles from './Modal.module.css'

const MODAL_TITLES: Record<string, string> = {
  'daily-rev': 'Daily Revenue Breakdown',
  'top-custs': 'All Customers — Revenue',
  'cust-marg': 'Customers by Margin %',
  'top-parts': 'All Parts — Revenue',
  'parts-marg': 'Parts by Margin %',
  'marg-split': 'Revenue Split',
  'inv-dist': 'Invoice Distribution',
  'cust-drill': 'Customer Drill-Down',
  'annotate': 'Edit Annotation',
  'invoice-detail': 'Invoice Details',
}

export default function Modal() {
  const { modalType, modalPayload, closeModal } = useDashboardStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeModal])

  const renderContent = () => {
    switch (modalType) {
      case 'daily-rev': return <DailyRevModal />
      case 'top-custs': case 'cust-marg': return <TopCustsModal type={modalType} />
      case 'top-parts': case 'parts-marg': return <TopPartsModal type={modalType} />
      case 'marg-split': return <MarginSplitModal />
      case 'inv-dist': return <InvDistModal />
      case 'cust-drill': return <CustDrillModal custName={modalPayload || ''} />
      case 'annotate': return <AnnotateModal />
      case 'invoice-detail': return <InvoiceSearchModal />
      default: return null
    }
  }

  return (
    <AnimatePresence>
      {modalType && (
        <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <motion.div className={styles.panel}
            initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
            <div className={styles.head}>
              <div className={styles.hl}>
                <div className={styles.ico}><svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                <div><div className={styles.title}>{MODAL_TITLES[modalType || ''] || 'Details'}</div>
                  <div className={styles.sub}>{useDashboardStore.getState().activeMonth}</div></div>
              </div>
              <button className={styles.close} onClick={closeModal}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className={styles.body}>{renderContent()}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}