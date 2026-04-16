export type Gender = 'Male' | 'Female' | 'Other'
export type DependantRelation = 'Spouse' | 'Son' | 'Daughter'

export interface UserSession {
  email: string
  nic: string
  isAdmin: boolean
}

export interface SheRecord {
  id: string
  name: string
  nic: string
  dob: string
  gender: Gender
  relation: string
  category: string
  effectiveDate: string
  grade: string
  totalPremium: number
  employeeVoluntaryEnhanceLimit: number
  note?: string
}

export interface SheResponse {
  employee: SheRecord | null
  dependants: SheRecord[]
}

export interface DependantPayload {
  name: string
  nic: string
  relation: DependantRelation
  dob: string
  gender: Gender
  userEmail?: string
}

export interface UpdateRecordPayload {
  name?: string
  relation?: DependantRelation
  dob?: string
  gender?: Gender
  category?: string
  effectiveDate?: string
  grade?: string
  totalPremium?: number
  employeeVoluntaryEnhanceLimit?: number
  note?: string
  userEmail?: string
}

export interface UserNotePayload {
  userEmail: string
  nic: string
  message: string
}

export interface UserChangeRequestPayload {
  userEmail: string
  nic: string
  targetRecordId: string
  changes: Record<string, string | number>
}

export interface AdminNote {
  id: string
  timestamp: string
  userEmail: string
  nic: string
  message: string
  status: string
  adminEmail: string
  adminComment: string
  requestType?: string
  targetRecordId?: string
  payloadJson?: string
}

export interface AdminNoteUpdatePayload {
  adminEmail: string
  status: string
  adminComment?: string
  applyToSheet: boolean
}

export interface SheetPreview {
  headers: string[]
  rows: string[][]
}
