import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { GlassCard } from '../components/common/GlassCard'
import { InputField } from '../components/common/InputField'
import { Spinner } from '../components/common/Spinner'
import { addDependant } from '../services/api'
import type { DependantPayload, UserSession } from '../types/models'
import { validateDependant } from '../utils/validation'

interface AddDependantPageProps {
  session: UserSession
  onNotify: (message: string, variant?: 'success' | 'error' | 'info') => void
}

export const AddDependantPage = ({ session, onNotify }: AddDependantPageProps) => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<DependantPayload>({
    name: '',
    nic: session.nic,
    relation: 'Spouse',
    dob: '',
    gender: 'Male',
    userEmail: session.email,
  })

  const setValue = (key: keyof DependantPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async () => {
    const validationError = validateDependant(form)
    if (validationError) {
      onNotify(validationError, 'error')
      return
    }

    setSaving(true)
    try {
      await addDependant(form)
      onNotify('Dependant added successfully.', 'success')
      navigate('/dependants')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add dependant.'
      onNotify(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <GlassCard className="p-6">
        <h2 className="mb-4 text-2xl font-semibold text-white">Add New Dependant</h2>
        <div className="grid gap-4">
          <InputField label="Name" value={form.name} onChange={(v) => setValue('name', v)} />
          <InputField label="NIC Number" value={form.nic} onChange={(v) => setValue('nic', v)} readOnly />
          <InputField
            label="Relation"
            value={form.relation}
            onChange={(v) => setValue('relation', v)}
            options={[
              { label: 'Spouse', value: 'Spouse' },
              { label: 'Son', value: 'Son' },
              { label: 'Daughter', value: 'Daughter' },
            ]}
          />
          <InputField label="DOB" type="date" value={form.dob} onChange={(v) => setValue('dob', v)} />
          <InputField
            label="Gender"
            value={form.gender}
            onChange={(v) => setValue('gender', v)}
            options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' },
            ]}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={submit} disabled={saving}>
            {saving ? <Spinner /> : 'Submit'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
