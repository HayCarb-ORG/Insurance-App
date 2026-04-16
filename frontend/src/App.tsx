import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toast } from './components/common/Toast'
import { HeaderBar } from './components/layout/HeaderBar'
import { AddDependantPage } from './pages/AddDependantPage'
import { AdminPage } from './pages/AdminPage'
import { DashboardPage } from './pages/DashboardPage'
import { DependantsPage } from './pages/DependantsPage'
import { LoginPage } from './pages/LoginPage'
import { ViewDependantPage } from './pages/ViewDependantPage'
import type { UserSession } from './types/models'

type ToastVariant = 'success' | 'error' | 'info'

const ProtectedLayout = ({
  session,
  onLogout,
  children,
}: {
  session: UserSession
  onLogout: () => void
  children: ReactNode
}) => {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6">
      <HeaderBar email={session.email} nic={session.nic} isAdmin={session.isAdmin} onLogout={onLogout} />
      {children}
    </div>
  )
}

const ProtectedRoute = ({
  session,
  onLogout,
  children,
}: {
  session: UserSession | null
  onLogout: () => void
  children: ReactNode
}) => {
  if (!session) return <Navigate to="/" replace />
  return (
    <ProtectedLayout session={session} onLogout={onLogout}>
      {children}
    </ProtectedLayout>
  )
}

function App() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null)

  useEffect(() => {
    const storedSession = localStorage.getItem('insurance-session')
    if (storedSession) {
      setSession(JSON.parse(storedSession) as UserSession)
    }
  }, [])

  const notify = (message: string, variant: ToastVariant = 'info') => {
    setToast({ message, variant })
  }

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const actions = useMemo(
    () => ({
      onLogin: (nextSession: UserSession) => {
        setSession(nextSession)
        localStorage.setItem('insurance-session', JSON.stringify(nextSession))
      },
      onLogout: () => {
        setSession(null)
        localStorage.removeItem('insurance-session')
        notify('Logged out.', 'info')
      },
    }),
    [],
  )

  return (
    <div className="app-background min-h-screen">
      {toast ? <Toast message={toast.message} variant={toast.variant} /> : null}
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              session ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage onLogin={actions.onLogin} onNotify={notify} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute session={session} onLogout={actions.onLogout}>
                {session ? <DashboardPage session={session} onNotify={notify} /> : null}
              </ProtectedRoute>
            }
          />
          <Route
            path="/dependants"
            element={
              <ProtectedRoute session={session} onLogout={actions.onLogout}>
                {session ? <DependantsPage session={session} onNotify={notify} /> : null}
              </ProtectedRoute>
            }
          />
          <Route
            path="/dependants/new"
            element={
              <ProtectedRoute session={session} onLogout={actions.onLogout}>
                {session ? <AddDependantPage session={session} onNotify={notify} /> : null}
              </ProtectedRoute>
            }
          />
          <Route
            path="/dependants/:id"
            element={
              <ProtectedRoute session={session} onLogout={actions.onLogout}>
                {session ? <ViewDependantPage session={session} onNotify={notify} /> : null}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute session={session} onLogout={actions.onLogout}>
                {session ? <AdminPage session={session} onNotify={notify} /> : null}
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
