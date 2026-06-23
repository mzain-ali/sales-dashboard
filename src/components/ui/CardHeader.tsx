import styles from './CardHeader.module.css'
interface CardHeaderProps { title: string; subtitle?: string; badge?: React.ReactNode; actions?: React.ReactNode }
export default function CardHeader({ title, subtitle, badge, actions }: CardHeaderProps) {
  return (
    <div className={styles.header}>
      <div><div className={styles.title}>{title}</div>{subtitle && <div className={styles.sub}>{subtitle}</div>}</div>
      <div className={styles.right}>{badge}{actions}</div>
    </div>
  )
}