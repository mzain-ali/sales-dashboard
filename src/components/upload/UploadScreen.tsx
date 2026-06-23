'use client'
import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useDashboardStore } from '@/store/dashboardStore'
import { parseWorkbook } from '@/lib/parser'
import styles from './UploadScreen.module.css'

export default function UploadScreen() {
  const addMonth = useDashboardStore(s => s.addMonth)
  const months = useDashboardStore(s => s.months)
  const [drag, setDrag] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const dragCount = useRef(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(async (files: File[]) => {
    const xlsFiles = files.filter(f => f.name.match(/\.(xlsx|xls)$/i))
    if (!xlsFiles.length) return
    setLoading(true); setProgress(0)
    for (let i = 0; i < xlsFiles.length; i++) {
      const buf = await xlsFiles[i].arrayBuffer()
      const data = parseWorkbook(buf)
      addMonth(data)
      setProgress(Math.round((i + 1) / xlsFiles.length * 100))
    }
    setLoading(false)
  }, [addMonth])

  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); dragCount.current++; setDrag(true) }
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dragCount.current--; if (dragCount.current <= 0) { dragCount.current = 0; setDrag(false) } }
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); dragCount.current = 0; setDrag(false); processFiles(Array.from(e.dataTransfer.files)) }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) processFiles(Array.from(e.target.files)); e.target.value = '' }

  const hasMonths = Object.keys(months).length > 0

  return (
    <AnimatePresence>
      {!hasMonths && (
        <motion.div className={styles.screen} initial={{ opacity: 1 }} exit={{ opacity: 0, scale: .97 }} transition={{ duration: .4 }}>
          <div className={styles.logo}>
            <div className={styles.mark}><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
            <div className={styles.name}>HMI Parts <span>· Sales Intelligence</span></div>
          </div>
          <div className={[styles.zone, drag ? styles.drag : ''].join(' ')} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}>
            <div className={styles.ico}><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg></div>
            <h2>Drop your monthly cost sheets</h2>
            <p>Upload one or multiple Excel files. Load several months to unlock month-over-month comparison. All data stays in your browser.</p>
            <label className={styles.btn} htmlFor="file-upload">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Choose Excel files
            </label>
            <input ref={fileRef} id="file-upload" type="file" accept=".xlsx,.xls" multiple onChange={onChange} style={{ display: 'none' }} />
            <div className={styles.hint}>XLSX · XLS · Multiple files supported</div>
          </div>
          {loading && <div className={styles.progress} style={{ width: '100%', maxWidth: 320, marginTop: 32 }}><div className={styles.bar} style={{ width: `${progress}%` }} /></div>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}