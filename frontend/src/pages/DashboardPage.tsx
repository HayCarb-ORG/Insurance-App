import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { GlassCard } from '../components/common/GlassCard'
import { InputField } from '../components/common/InputField'
import { Spinner } from '../components/common/Spinner'
import { getSheByNic, submitChangeRequest, submitUserNote } from '../services/api'
import type { SheRecord, UserSession } from '../types/models'

interface DashboardPageProps {
  session: UserSession
  onNotify: (message: string, variant?: 'success' | 'error' | 'info') => void
}

export const DashboardPage = ({ session, onNotify }: DashboardPageProps) => {
  const [employee, setEmployee] = useState<SheRecord | null>(null)
  const [originalEmployee, setOriginalEmployee] = useState<SheRecord | null>(null)
  const [note, setNote] = useState('')
  const [showNoteField, setShowNoteField] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingNote, setSendingNote] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getSheByNic(session.nic)
        setEmployee(data.employee)
        setOriginalEmployee(data.employee)
        setNote('')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load employee data.'
        onNotify(message, 'error')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [onNotify, session.nic])

  const updateField = (key: keyof SheRecord, value: string) => {
    if (!employee) return

    setEmployee({
      ...employee,
      [key]: key === 'totalPremium' ? Number(value) : value,
    })
  }

  const saveChanges = async () => {
    if (!employee || !originalEmployee) return

    const requestedChanges: Record<string, string | number> = {}
    if (employee.name !== originalEmployee.name) requestedChanges.name = employee.name
    if (employee.dob !== originalEmployee.dob) requestedChanges.dob = employee.dob
    if (employee.gender !== originalEmployee.gender) requestedChanges.gender = employee.gender
    if (employee.relation !== originalEmployee.relation) requestedChanges.relation = employee.relation
    if (employee.category !== originalEmployee.category) requestedChanges.category = employee.category
    if (employee.effectiveDate !== originalEmployee.effectiveDate) {
      requestedChanges.effectiveDate = employee.effectiveDate
    }
    if (employee.grade !== originalEmployee.grade) requestedChanges.grade = employee.grade
    const currentEnhanceLimit = Number(employee.employeeVoluntaryEnhanceLimit || 0)
    const originalEnhanceLimit = Number(originalEmployee.employeeVoluntaryEnhanceLimit || 0)
    if (currentEnhanceLimit !== originalEnhanceLimit) {
      requestedChanges.employeeVoluntaryEnhanceLimit = currentEnhanceLimit
    }

    if (Object.keys(requestedChanges).length === 0) {
      onNotify('No editable changes detected.', 'info')
      return
    }

    setSaving(true)
    try {
      await submitChangeRequest({
        userEmail: session.email,
        nic: session.nic,
        targetRecordId: employee.id,
        changes: requestedChanges,
      })
      setOriginalEmployee(employee)
      onNotify('Change request sent to admin for approval.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit change request.'
      onNotify(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const sendNote = async () => {
    const trimmed = note.trim()
    if (!trimmed) {
      onNotify('Please enter a note before sending.', 'error')
      return
    }

    setSendingNote(true)
    try {
      await submitUserNote({
        userEmail: session.email,
        nic: session.nic,
        message: trimmed,
      })
      setNote('')
      setShowNoteField(false)
      onNotify('Note sent to admin queue.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send note.'
      onNotify(message, 'error')
    } finally {
      setSendingNote(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!employee) {
    return (
      <GlassCard className="p-8 text-center text-white">
        No employee profile found for NIC {session.nic}.
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="mb-4 text-2xl font-semibold text-white">Employee Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="Name" value={employee.name} onChange={(v) => updateField('name', v)} />
          <InputField label="NIC Number" value={employee.nic} onChange={(v) => updateField('nic', v)} readOnly />
          <InputField label="DOB" type="date" value={employee.dob} onChange={(v) => updateField('dob', v)} />
          <InputField
            label="Gender"
            value={employee.gender}
            onChange={(v) => updateField('gender', v)}
            options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' },
            ]}
          />
          <InputField label="Relation" value={employee.relation} onChange={(v) => updateField('relation', v)} />
          <InputField label="Category" value={employee.category} onChange={(v) => updateField('category', v)} />
          <InputField
            label="Effective Date"
            type="date"
            value={employee.effectiveDate}
            onChange={(v) => updateField('effectiveDate', v)}
          />
          <InputField label="Grade" value={employee.grade} onChange={(v) => updateField('grade', v)} />
          <InputField
            label="Employee Voluntary Enhance Limit"
            type="number"
            value={employee.employeeVoluntaryEnhanceLimit}
            onChange={(v) => updateField('employeeVoluntaryEnhanceLimit', v)}
          />
        </div>

        {showNoteField ? (
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-white">Note</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="h-24 w-full rounded-lg border border-white/25 bg-black/45 p-3 text-white outline-none focus:border-emerald-300"
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/dependants/new">
            <Button>Add New Dependant</Button>
          </Link>
          <Button variant="secondary" onClick={() => setShowNoteField((state) => !state)}>
            Add A Note
          </Button>
          {showNoteField ? (
            <Button variant="secondary" onClick={sendNote} disabled={sendingNote}>
              {sendingNote ? <Spinner /> : 'Send Note To Admin'}
            </Button>
          ) : null}
          <Link to="/dependants">
            <Button variant="secondary">Check For Dependant</Button>
          </Link>
          <Button onClick={saveChanges} disabled={saving}>
            {saving ? <Spinner /> : 'Submit Editable Changes'}
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
