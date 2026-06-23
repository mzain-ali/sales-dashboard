'use client'
import { useState } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { exportToExcel } from '@/lib/share'
import { generateWhatsAppSummary } from '@/lib/share'
import Toast from '@/components/ui/Toast'
import styles from './Topbar.module.css'

export default function Topbar({ fileInputId }: { fileInputId: string }) {
  const { activeMonth, months, settings, setSettingsPanelOpen } = useDashboardStore()
  const data = months[activeMonth]
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  function showToast(msg: string) { setToast(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 2500) }

  async function handleExport() { if (!data) return; await exportToExcel(data); showToast('Excel file downloaded!') }
  async function handleShare() {
    if (!data) return
    const text = generateWhatsAppSummary(data, settings)
    await navigator.clipboard.writeText(text)
    showToast('Summary copied — paste into WhatsApp!')
  }

  const totInv = data?.totInv || 0
  const uCusts = data?.uCusts || 0
  const uParts = data?.uParts || 0

  return (
    <>
      <header className={styles.bar}>
        <div className={styles.left}>
          <div className={styles.mark}><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
          <span className={`${styles.name} font-display`}>HMI Parts</span>
          <div className={styles.divider} />
          <span className={styles.pill}>{activeMonth || '—'}</span>
        </div>
        <div className={styles.right}>
          {data && <span className={styles.meta}>{totInv} invoices · {uCusts} customers · {uParts} parts</span>}
          <label className={styles.btn} htmlFor={fileInputId}><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>Add month</label>
          <button className={`${styles.btn} ${styles.green}`} onClick={handleExport}><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export Excel</button>
          <button className={styles.btn} onClick={handleShare}><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>Share</button>
          <button className={styles.btn} onClick={() => setSettingsPanelOpen(true)}><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>Settings</button>
          <button className={`${styles.btn} no-print`} onClick={() => window.print()}><svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print</button>
        </div>
      </header>
      <Toast message={toast} visible={toastVisible} />
    </>
  )
}