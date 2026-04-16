import { useState } from 'react'
import { GlassCard } from '../components/common/GlassCard'
import { Button } from '../components/common/Button'
import { InputField } from '../components/common/InputField'
import { Spinner } from '../components/common/Spinner'
import { authByEmail } from '../services/api'
import { isValidEmail } from '../utils/validation'
import type { UserSession } from '../types/models'
import hayCarbLogo from '../assets/HayCarb Logo.png'

interface LoginPageProps {
  onLogin: (session: UserSession) => void
  onNotify: (message: string, variant?: 'success' | 'error' | 'info') => void
}

export const LoginPage = ({ onLogin, onNotify }: LoginPageProps) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!isValidEmail(email)) {
      onNotify('Please enter a valid email address.', 'error')
      return
    }

    setLoading(true)
    try {
      const session = await authByEmail(email)
      onLogin(session)
      onNotify('Sign in successful.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed.'
      onNotify(`⚠ ${message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <GlassCard className="w-full max-w-md p-8">
        <div className="mb-6 flex items-center justify-center">
          <div className="rounded-2xl border border-white/20 bg-black/35 p-3 shadow-lg shadow-black/40">
            <img src={hayCarbLogo} alt="HayCarb Logo" className="h-14 w-auto" />
          </div>
        </div>
        <h1 className="text-center text-3xl font-bold tracking-tight text-white">
          Insurance App
        </h1>
        <p className="mt-2 text-center text-sm text-white/85">Internal Insurance / SHE Management</p>

        <div className="mt-6 space-y-4">
          <InputField
            label="Company Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="name@company.com"
          />
          <Button className="w-full" onClick={handleSignIn} disabled={loading}>
            {loading ? <Spinner /> : 'Sign In'}
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
