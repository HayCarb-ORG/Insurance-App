import { Link } from 'react-router-dom'
import { Button } from '../common/Button'

interface HeaderBarProps {
  email: string
  nic: string
  isAdmin: boolean
  onLogout: () => void
}

export const HeaderBar = ({ email, nic, isAdmin, onLogout }: HeaderBarProps) => {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200/20 bg-black/45 p-4 shadow-lg shadow-black/40 backdrop-blur-lg">
      <div>
        <p className="text-sm text-white/80">Logged User</p>
        <p className="font-semibold text-white">
          {email} | NIC: {nic}
        </p>
        {isAdmin ? <p className="text-xs text-emerald-200">Role: Admin</p> : null}
      </div>

      <div className="flex items-center gap-2">
        <Link to="/dashboard">
          <Button variant="secondary">Dashboard</Button>
        </Link>
        <Link to="/dependants">
          <Button variant="secondary">Dependants</Button>
        </Link>
        {isAdmin ? (
          <Link to="/admin">
            <Button variant="secondary">Admin</Button>
          </Link>
        ) : null}
        <Button variant="danger" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </header>
  )
}
