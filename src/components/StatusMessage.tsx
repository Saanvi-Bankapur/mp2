import styles from './StatusMessage.module.css'

interface StatusMessageProps {
  kind: 'loading' | 'error' | 'empty'
  message: string
  onRetry?: () => void
}

export default function StatusMessage({ kind, message, onRetry }: StatusMessageProps) {
  return (
    <div className={`${styles.status} ${styles[kind]}`} role={kind === 'error' ? 'alert' : 'status'}>
      {kind === 'loading' && <span className={styles.spinner} aria-hidden="true" />}
      <p>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
