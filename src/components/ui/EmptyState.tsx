import styles from './EmptyState.module.css'
interface EmptyStateProps { icon?: string; title: string; body?: string }
export default function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 24 24" className={styles.ico} fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      <p className={styles.title}>{title}</p>
      {body && <p className={styles.body}>{body}</p>}
    </div>
  )
}