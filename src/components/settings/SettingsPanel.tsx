'use client'
import { motion, AnimatePresence } from 'motion/react'
import { useDashboardStore } from '@/store/dashboardStore'
import { DEFAULT_SETTINGS } from '@/lib/types'
import styles from './SettingsPanel.module.css'
export default function SettingsPanel() {
  const { settingsPanelOpen, setSettingsPanelOpen, settings, updateSettings } = useDashboardStore()
  const set = (k: keyof typeof settings, v: number) => updateSettings({ [k]: v })
  return (
    <AnimatePresence>
      {settingsPanelOpen && (
        <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSettingsPanelOpen(false)}>
          <motion.div className={styles.panel} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 350, damping: 35 }} onClick={e => e.stopPropagation()}>
            <div className={styles.head}>
              <div className={styles.title}>Alert Settings</div>
              <button className={styles.close} onClick={() => setSettingsPanelOpen(false)}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className={styles.body}>
              <div className={styles.section}>
                <div className={styles.sectionLabel}>Alert Thresholds</div>
                {[
                  { key: 'marginWarnPct' as const, label: 'Margin target %', suffix: '%' },
                  { key: 'concentrationWarnPct' as const, label: 'Max customer concentration %', suffix: '%' },
                  { key: 'lowMarginItemPct' as const, label: 'Low margin item threshold %', suffix: '%' },
                  { key: 'smallInvoiceOMR' as const, label: 'Small invoice value OMR', suffix: '' },
                  { key: 'smallInvoicePct' as const, label: 'Small invoice alert when % exceed', suffix: '%' },
                ].map(({ key, label }) => (
                  <div key={key} className={styles.row}>
                    <span className={styles.rowLabel}>{label}</span>
                    <input className={styles.inp} type="number" value={settings[key]} onChange={e => set(key, parseFloat(e.target.value) || 0)} />
                  </div>
                ))}
                <button className={styles.reset} onClick={() => updateSettings(DEFAULT_SETTINGS)}>Reset to defaults</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}