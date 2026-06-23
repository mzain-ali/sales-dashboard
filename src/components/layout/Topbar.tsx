'use client'
import { useState, useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { exportToExcel } from '@/lib/share'
import { generateWhatsAppSummary } from '@/lib/share'
import Toast from '@/components/ui/Toast'
import type { InvoiceData } from '@/lib/types'
import { exportToPDF } from '@/lib/pdfExport'
import styles from './Topbar.module.css'

export default function Topbar({ fileInputId }: { fileInputId: string }) {
  const { activeMonth, months, dateRange, crossFilter, settings, setSettingsPanelOpen, openModal } = useDashboardStore()
  const data = months[activeMonth]
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const matches = useMemo(() => {
    if (!searchQuery.trim() || !data) return []
    const q = searchQuery.toLowerCase()
    return data.invoices
      .filter((inv: InvoiceData) => inv.bill.toLowerCase().includes(q) || inv.cust.toLowerCase().includes(q))
      .slice(0, 8)
  }, [searchQuery, data])

  function showToast(msg: string) { setToast(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 2500) }

  async function handleExport() { if (!data) return; await exportToExcel(data); showToast('Excel file downloaded!') }
  async function handlePDF() {
    if (!data) return
    exportToPDF(months, activeMonth, dateRange, crossFilter, settings)
    showToast('PDF report downloaded!')
  }
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
          {data && (
            <div style={{ position: 'relative', zIndex: 110 }} className="no-print">
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7, padding: '4px 10px', gap: 6 }}>
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="var(--text-muted)" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  type="text"
                  placeholder="Search invoice/client..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--text-primary)', width: 160 }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="var(--text-muted)" fill="none" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                )}
              </div>
              {matches.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  width: 280,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  boxShadow: 'var(--shadow-md)',
                  overflow: 'hidden',
                  padding: '4px 0',
                }}>
                  {matches.map((inv: InvoiceData) => (
                    <div
                      key={inv.bill}
                      onClick={() => {
                        openModal('invoice-detail', inv.bill)
                        setSearchQuery('')
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        borderBottom: '1px solid var(--surface-2)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{inv.bill}</span>
                        <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>OMR {inv.rev.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inv.cust}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <label className={styles.btn} htmlFor={fileInputId}><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>Add month</label>
          <button className={`${styles.btn} ${styles.green}`} onClick={handleExport}><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export Excel</button>
          <button className={`${styles.btn} ${styles.red}`} onClick={handlePDF}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            PDF Report
          </button>
          <button className={styles.btn} onClick={handleShare}><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>Share</button>
          <button className={styles.btn} onClick={() => setSettingsPanelOpen(true)}><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>Settings</button>
          <button className={`${styles.btn} no-print`} onClick={() => window.print()}><svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print</button>
        </div>
      </header>
      <Toast message={toast} visible={toastVisible} />
    </>
  )
}