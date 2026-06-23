'use client'
import { motion } from 'motion/react'
import styles from './Card.module.css'
interface CardProps { children: React.ReactNode; clickable?: boolean; onClick?: () => void; className?: string }
export default function Card({ children, clickable, onClick, className }: CardProps) {
  return (
    <motion.div
      className={[styles.card, clickable ? styles.clickable : '', className || ''].join(' ')}
      onClick={onClick}
      whileHover={clickable ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >{children}</motion.div>
  )
}