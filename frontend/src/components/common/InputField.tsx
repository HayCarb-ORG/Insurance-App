interface SelectOption {
  label: string
  value: string
}

interface InputFieldProps {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'date' | 'number'
  readOnly?: boolean
  placeholder?: string
  options?: SelectOption[]
}

export const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  readOnly = false,
  placeholder,
  options,
}: InputFieldProps) => {
  return (
    <label className="flex flex-col gap-1 text-sm text-white/90">
      <span className="font-medium">{label}</span>
      {options ? (
        <select
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          disabled={readOnly}
          className="rounded-lg border border-white/25 bg-black/45 px-3 py-2 text-white outline-none focus:border-emerald-300"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          type={type}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className="rounded-lg border border-white/25 bg-black/45 px-3 py-2 text-white placeholder:text-slate-300 outline-none focus:border-emerald-300 read-only:cursor-not-allowed read-only:bg-black/30"
        />
      )}
    </label>
  )
}
