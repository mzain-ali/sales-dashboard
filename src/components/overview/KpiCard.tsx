'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from 'motion/react'
import styles from './KpiCard.module.css'

interface KpiCardProps {
  label: string; value: string; sub: string; arc: number; color: string
  chip?: { text: string; variant: string }; onClick?: () => void
}

export default function KpiCard({ label, value, sub, arc, color, chip, onClick }: KpiCardProps) {
  const reduce = useReducedMotion()
  const arcRef = useRef<SVGCircleElement>(null)
  const r = 33; const circ = 2 * Math.PI * r
  const fill = Math.min(Math.max(arc, 0), 100) / 100
  const offset = circ * (1 - fill)

  useEffect(() => {
    const el = arcRef.current; if (!el || reduce) return
    el.style.strokeDashoffset = String(circ)
    const t = setTimeout(() => { el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)'; el.style.strokeDashoffset = String(offset) }, 80)
    return () => clearTimeout(t)
  }, [circ, offset, reduce])

  return (
    <motion.div className={styles.card} style={{ '--kc': color } as React.CSSProperties} onClick={onClick}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)', borderColor: color }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      <div className={styles.top}>
        <div className={styles.label}>{label}</div>
        <div className={styles.arc}>
          <svg width="38" height="38" viewBox="0 0 38 38">
            <circle cx="19" cy="19" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
            <circle ref={arcRef} cx="19" cy="19" r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={reduce ? offset : circ} />
          </svg>
          <div className={styles.arcLbl}>{Math.round(arc)}%</div>
        </div>
      </div>
      <div className={[styles.val, value.length > 10 ? styles.sm : ''].join(' ')}>{value}</div>
      <div className={styles.sub}>
        {chip && <span className={styles.chip} style={{ background: chip.variant === 'green' ? 'var(--green-light)' : 'var(--amber-light)', color: chip.variant === 'green' ? 'var(--green)' : 'var(--amber)' }}>{chip.text}</span>}
        {sub}
      </div>
      <div className={styles.hint}>Tap to explore</div>
    </motion.div>
  )
}