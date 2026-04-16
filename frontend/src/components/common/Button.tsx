import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  variant?: 'primary' | 'secondary' | 'danger'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-300/30',
  secondary: 'bg-black/45 hover:bg-black/60 text-white border border-white/25',
  danger: 'bg-rose-700/85 hover:bg-rose-600 text-white border border-rose-300/30',
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
