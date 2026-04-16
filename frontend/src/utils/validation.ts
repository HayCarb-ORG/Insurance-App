import type { DependantPayload } from '../types/models'

export const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export const validateDependant = (payload: DependantPayload): string | null => {
  if (!payload.name.trim()) return 'Name is required.'
  if (!payload.nic.trim()) return 'NIC is required.'
  if (!payload.relation.trim()) return 'Relation is required.'
  if (!payload.dob.trim()) return 'Date of birth is required.'
  return null
}
