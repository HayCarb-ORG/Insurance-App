import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { GlassCard } from '../components/common/GlassCard'
import { InputField } from '../components/common/InputField'
import { Spinner } from '../components/common/Spinner'
import { getSheByNic, updateRecord } from '../services/api'
import type { DependantRelation, SheRecord, UserSession } from '../types/models'

const dependantRelations: DependantRelation[] = ['Spouse', 'Son', 'Daughter']

interface ViewDependantPageProps {
  session: UserSession
  onNotify: (message: string, variant?: 'success' | 'error' | 'info') => void
}

export const ViewDependantPage = ({ session, onNotify }: ViewDependantPageProps) => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [dependant, setDependant] = useState<SheRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getSheByNic(session.nic)
        const selected = data.dependants.find((record) => record.id === id) ?? null
        setDependant(selected)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load dependant details.'
        onNotify(message, 'error')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id, onNotify, session.nic])

  const setField = (key: keyof SheRecord, value: string) => {
    if (!dependant) return
    setDependant({ ...dependant, [key]: value })
  }

  const save = async () => {
    if (!dependant) return

    const relation = dependantRelations.find((item) => item === dependant.relation)

    setSaving(true)
    try {
      await updateRecord(dependant.id, {
        name: dependant.name,
        relation,
        dob: dependant.dob,
        gender: dependant.gender,
        userEmail: session.email,
      })
      onNotify('Dependant updated.', 'success')
      navigate('/dependants')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed.'
      onNotify(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!dependant) {
    return <GlassCard className="p-6 text-white">Dependant not found.</GlassCard>
  }

  return (
    <div className="mx-auto max-w-xl">
      <GlassCard className="p-6">
        <h2 className="mb-4 text-2xl font-semibold text-white">Dependant Details</h2>
        <div className="grid gap-4">
          <InputField label="Name" value={dependant.name} onChange={(v) => setField('name', v)} />
          <InputField label="NIC" value={dependant.nic} onChange={(v) => setField('nic', v)} readOnly />
          <InputField
            label="Relation"
            value={dependant.relation}
            onChange={(v) => setField('relation', v)}
            options={[
              { label: 'Spouse', value: 'Spouse' },
              { label: 'Son', value: 'Son' },
              { label: 'Daughter', value: 'Daughter' },
            ]}
          />
          <InputField label="DOB" type="date" value={dependant.dob} onChange={(v) => setField('dob', v)} />
          <InputField
            label="Gender"
            value={dependant.gender}
            onChange={(v) => setField('gender', v)}
            options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' },
            ]}
          />
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? <Spinner /> : 'Save'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/dependants')}>
            Back
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
