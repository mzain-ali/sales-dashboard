'use client'
import { useReducedMotion } from 'motion/react'
import { motion } from 'motion/react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import styles from './SparkCard.module.css'

interface SparkCardProps { label: string; value: string; sub: string; data: number[]; color: string; onClick?: () => void }

export default function SparkCard({ label, value, sub, data, color, onClick }: SparkCardProps) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <motion.div className={styles.card} onClick={onClick}
      whileHover={{ y: -1, borderColor: color, boxShadow: 'var(--shadow-md)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} dot={false} isAnimationActive={true} animationDuration={800} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.sub}>{sub}</div>
    </motion.div>
  )
}