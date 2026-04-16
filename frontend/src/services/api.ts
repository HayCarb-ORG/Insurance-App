import type {
  AdminNote,
  AdminNoteUpdatePayload,
  DependantPayload,
  SheResponse,
  SheetPreview,
  UpdateRecordPayload,
  UserChangeRequestPayload,
  UserNotePayload,
  UserSession,
} from '../types/models'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: 'Request failed.' }))
    const message = typeof errorBody?.detail === 'string' ? errorBody.detail : 'Request failed.'
    throw new Error(message)
  }

  return (await response.json()) as T
}

export const authByEmail = async (email: string): Promise<UserSession> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/${encodeURIComponent(email)}`)
  const data = await parseResponse<{ email: string; nic: string; isAdmin: boolean }>(response)
  return { email: data.email, nic: data.nic, isAdmin: data.isAdmin }
}

export const getSheByNic = async (nic: string): Promise<SheResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/she/${encodeURIComponent(nic)}`)
  return parseResponse<SheResponse>(response)
}

export const addDependant = async (payload: DependantPayload): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/she/dependant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse<{ id: string }>(response)
}

export const updateRecord = async (
  id: string,
  payload: UpdateRecordPayload,
): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/api/she/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse<{ success: boolean }>(response)
}

export const submitUserNote = async (payload: UserNotePayload): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/she/note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse<{ id: string }>(response)
}

export const submitChangeRequest = async (
  payload: UserChangeRequestPayload,
): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/she/change-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse<{ id: string }>(response)
}

export const getAdminNotes = async (email: string, status = 'NEW'): Promise<AdminNote[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/notes?email=${encodeURIComponent(email)}&status=${encodeURIComponent(status)}`,
  )
  return parseResponse<AdminNote[]>(response)
}

export const updateAdminNote = async (
  noteId: string,
  payload: AdminNoteUpdatePayload,
): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/notes/${encodeURIComponent(noteId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse<{ success: boolean }>(response)
}

export const deleteAdminNote = async (email: string, noteId: string): Promise<{ success: boolean }> => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/notes/${encodeURIComponent(noteId)}?email=${encodeURIComponent(email)}`,
    {
      method: 'DELETE',
    },
  )

  return parseResponse<{ success: boolean }>(response)
}

export const clearAdminNotes = async (
  email: string,
  status: 'RESOLVED' | 'ALL' = 'RESOLVED',
): Promise<{ success: boolean; removed: number }> => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/notes?email=${encodeURIComponent(email)}&status=${encodeURIComponent(status)}`,
    {
      method: 'DELETE',
    },
  )

  return parseResponse<{ success: boolean; removed: number }>(response)
}

export const getSheetPreview = async (email: string, limit = 80): Promise<SheetPreview> => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/sheet-preview?email=${encodeURIComponent(email)}&limit=${limit}`,
  )
  return parseResponse<SheetPreview>(response)
}

export const downloadSheSheet = async (email: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/download/she?email=${encodeURIComponent(email)}`)
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: 'Download failed.' }))
    const message = typeof errorBody?.detail === 'string' ? errorBody.detail : 'Download failed.'
    throw new Error(message)
  }

  return response.blob()
}

export const uploadSheSheet = async (email: string, file: File): Promise<{ success: boolean }> => {
  const formData = new FormData()
  formData.append('email', email)
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/admin/upload/she`, {
    method: 'POST',
    body: formData,
  })

  return parseResponse<{ success: boolean }>(response)
}
