import { Link } from 'react-router-dom'
import StatusMessage from '../components/StatusMessage'

export default function NotFound() {
  return (
    <section>
      <StatusMessage kind="empty" message="This page wandered into the tall grass." />
      <p>
        <Link to="/">Go back to the list</Link>
      </p>
    </section>
  )
}
