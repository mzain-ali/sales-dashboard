'use client'
import { motion, AnimatePresence } from 'motion/react'
import styles from './Toast.module.css'
interface ToastProps { message: string; visible: boolean }
export default function Toast({ message, visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div className={styles.toast} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}