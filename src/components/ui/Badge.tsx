interface BadgeProps { children: React.ReactNode; variant?: 'indigo'|'green'|'red'|'amber'|'purple'|'sky' }
export default function Badge({ children, variant = 'indigo' }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}