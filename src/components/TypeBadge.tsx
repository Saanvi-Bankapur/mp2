import styles from './TypeBadge.module.css'

interface TypeBadgeProps {
  type: string
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  return <span className={`${styles.badge} ${styles[type] ?? ''}`}>{type}</span>
}
