import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../components/common/GlassCard'
import { Spinner } from '../components/common/Spinner'
import { getSheByNic } from '../services/api'
import type { SheRecord, UserSession } from '../types/models'

interface DependantsPageProps {
  session: UserSession
  onNotify: (message: string, variant?: 'success' | 'error' | 'info') => void
}

export const DependantsPage = ({ session, onNotify }: DependantsPageProps) => {
  const [dependants, setDependants] = useState<SheRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getSheByNic(session.nic)
        setDependants(data.dependants)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load dependants.'
        onNotify(message, 'error')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [onNotify, session.nic])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-white">Existing Dependants</h2>
      <div className="grid gap-3">
        {dependants.map((dep) => (
          <Link key={dep.id} to={`/dependants/${dep.id}`}>
            <GlassCard className="flex items-center justify-between p-4 transition hover:bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/85 text-sm">👤</span>
                <div>
                  <p className="font-semibold text-white">{dep.name}</p>
                  <p className="text-sm text-white/80">{dep.relation}</p>
                </div>
              </div>
              <span className="text-xl text-white">›</span>
            </GlassCard>
          </Link>
        ))}
        {dependants.length === 0 ? (
          <GlassCard className="p-4 text-white">No dependants found for NIC {session.nic}.</GlassCard>
        ) : null}
      </div>
    </div>
  )
}
