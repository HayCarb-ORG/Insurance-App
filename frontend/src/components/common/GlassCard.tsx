import type { PropsWithChildren } from 'react'

interface GlassCardProps extends PropsWithChildren {
  className?: string
}

export const GlassCard = ({ children, className = '' }: GlassCardProps) => {
  return (
    <div
      className={`bg-black/45 backdrop-blur-lg border border-emerald-200/20 rounded-xl shadow-lg shadow-black/40 ${className}`.trim()}
    >
      {children}
    </div>
  )
}
