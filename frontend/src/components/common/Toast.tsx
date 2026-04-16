interface ToastProps {
  message: string
  variant?: 'success' | 'error' | 'info'
}

const variantMap: Record<NonNullable<ToastProps['variant']>, string> = {
  success: 'bg-emerald-500/90',
  error: 'bg-rose-500/90',
  info: 'bg-emerald-600/90',
}

export const Toast = ({ message, variant = 'info' }: ToastProps) => {
  return (
    <div className={`fixed right-6 top-6 z-50 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${variantMap[variant]}`}>
      {message}
    </div>
  )
}
