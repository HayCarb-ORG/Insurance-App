import { useEffect, useState } from 'react'
import { Button } from '../components/common/Button'
import { GlassCard } from '../components/common/GlassCard'
import { Spinner } from '../components/common/Spinner'
import {
  clearAdminNotes,
  deleteAdminNote,
  downloadOracleSheet,
  downloadSheSheet,
  getAdminNotes,
  getSheetPreview,
  updateAdminNote,
  uploadOracleSheet,
  uploadSheSheet,
} from '../services/api'
import type { AdminNote, SheetPreview, UserSession } from '../types/models'

interface AdminPageProps {
  session: UserSession
  onNotify: (message: string, variant?: 'success' | 'error' | 'info') => void
}

export const AdminPage = ({ session, onNotify }: AdminPageProps) => {
  const [notes, setNotes] = useState<AdminNote[]>([])
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'RESOLVED'>('ALL')
  const [sheet, setSheet] = useState<SheetPreview>({ headers: [], rows: [] })
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [loadingSheet, setLoadingSheet] = useState(true)
  const [workingNoteId, setWorkingNoteId] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [oracleUploadFile, setOracleUploadFile] = useState<File | null>(null)
  const [oracleUploading, setOracleUploading] = useState(false)

  const parsePayload = (payloadJson?: string): Record<string, unknown> => {
    if (!payloadJson) return {}
    try {
      const parsed = JSON.parse(payloadJson)
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }

  const loadNotes = async () => {
    setLoadingNotes(true)
    try {
      const data = await getAdminNotes(session.email, statusFilter)
      setNotes(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load admin notes.'
      onNotify(message, 'error')
    } finally {
      setLoadingNotes(false)
    }
  }

  const loadSheet = async () => {
    setLoadingSheet(true)
    try {
      const data = await getSheetPreview(session.email, 80)
      setSheet(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load sheet preview.'
      onNotify(message, 'error')
    } finally {
      setLoadingSheet(false)
    }
  }

  useEffect(() => {
    void loadNotes()
    void loadSheet()
  }, [statusFilter])

  const resolve = async (note: AdminNote, applyToSheet: boolean) => {
    setWorkingNoteId(note.id)
    try {
      await updateAdminNote(note.id, {
        adminEmail: session.email,
        status: 'RESOLVED',
        adminComment: applyToSheet ? 'Updated in SHE by admin.' : 'Reviewed by admin.',
        applyToSheet,
      })
      onNotify(applyToSheet ? 'Note resolved and applied to SHE.' : 'Note marked as reviewed.', 'success')
      await loadNotes()
      if (applyToSheet) await loadSheet()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resolve note.'
      onNotify(message, 'error')
    } finally {
      setWorkingNoteId(null)
    }
  }

  const handleDownload = async () => {
    try {
      const blob = await downloadSheSheet(session.email)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'SHE.xlsx'
      anchor.click()
      window.URL.revokeObjectURL(url)
      onNotify('SHE sheet download started.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Download failed.'
      onNotify(message, 'error')
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) {
      onNotify('Please choose an Excel file first.', 'error')
      return
    }

    setUploading(true)
    try {
      await uploadSheSheet(session.email, uploadFile)
      onNotify('Latest SHE sheet uploaded successfully.', 'success')
      setUploadFile(null)
      await loadSheet()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.'
      onNotify(message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleOracleDownload = async () => {
    try {
      const blob = await downloadOracleSheet(session.email)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'Oracle.xlsx'
      anchor.click()
      window.URL.revokeObjectURL(url)
      onNotify('Oracle sheet download started.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Download failed.'
      onNotify(message, 'error')
    }
  }

  const handleOracleUpload = async () => {
    if (!oracleUploadFile) {
      onNotify('Please choose Oracle.xlsx first.', 'error')
      return
    }

    setOracleUploading(true)
    try {
      await uploadOracleSheet(session.email, oracleUploadFile)
      onNotify('Latest Oracle sheet uploaded successfully. New users can login immediately.', 'success')
      setOracleUploadFile(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.'
      onNotify(message, 'error')
    } finally {
      setOracleUploading(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    setWorkingNoteId(noteId)
    try {
      await deleteAdminNote(session.email, noteId)
      onNotify('Note deleted.', 'success')
      await loadNotes()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed.'
      onNotify(message, 'error')
    } finally {
      setWorkingNoteId(null)
    }
  }

  const handleClearResolved = async () => {
    try {
      const result = await clearAdminNotes(session.email, 'RESOLVED')
      onNotify(`Cleared ${result.removed} resolved notes.`, 'success')
      await loadNotes()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cleanup failed.'
      onNotify(message, 'error')
    }
  }

  if (!session.isAdmin) {
    return <GlassCard className="p-6 text-white">Admin access required.</GlassCard>
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-white">Admin Notes Queue</h2>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'ALL' | 'NEW' | 'RESOLVED')}
              className="rounded-lg border border-white/25 bg-black/45 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300"
            >
              <option value="ALL">All</option>
              <option value="NEW">New</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <Button variant="secondary" onClick={loadNotes}>
              Refresh Notes
            </Button>
            <Button variant="secondary" onClick={handleClearResolved}>
              Clear Resolved
            </Button>
          </div>
        </div>
        {loadingNotes ? (
          <Spinner />
        ) : notes.length === 0 ? (
          <p className="text-white/90">No notes found for the selected filter.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-white/20 bg-black/45 p-4 text-white">
                <p className="text-sm text-white/80">{note.timestamp}</p>
                <p className="mt-1 text-sm">User: {note.userEmail}</p>
                <p className="text-sm">NIC: {note.nic}</p>
                <p className="mt-2">{note.message}</p>
                <p className="mt-1 text-xs text-emerald-200">Type: {note.requestType || 'NOTE'}</p>
                {note.requestType === 'CHANGE' || note.requestType?.startsWith('DEPENDANT_') ? (
                  <div className="mt-2 rounded-md bg-black/20 p-2 text-xs">
                    {Object.entries(parsePayload(note.payloadJson)).map(([key, value]) => (
                      <p key={key}>
                        {key}: {String(value)}
                      </p>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {note.status !== 'RESOLVED' ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => resolve(note, false)}
                        disabled={workingNoteId === note.id}
                      >
                        Mark Reviewed
                      </Button>
                      <Button onClick={() => resolve(note, true)} disabled={workingNoteId === note.id}>
                        Apply To SHE + Resolve
                      </Button>
                    </>
                  ) : (
                    <span className="rounded-md bg-emerald-700/50 px-2 py-1 text-xs">Already resolved</span>
                  )}
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(note.id)}
                    disabled={workingNoteId === note.id}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-white">SHE Data Preview</h2>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadSheet}>
              Refresh Preview
            </Button>
            <Button onClick={handleDownload}>Download SHE.xlsx</Button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-black/35 p-3">
          <input
            type="file"
            accept=".xlsx"
            onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
            className="text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600/85 file:px-3 file:py-2 file:text-white"
          />
          <Button onClick={handleUpload} disabled={uploading || !uploadFile}>
            {uploading ? <Spinner /> : 'Upload Latest SHE.xlsx'}
          </Button>
        </div>

        {loadingSheet ? (
          <Spinner />
        ) : (
          <div className="overflow-auto rounded-lg border border-white/20">
            <table className="min-w-full bg-black/40 text-left text-xs text-white">
              <thead className="bg-black/55">
                <tr>
                  {sheet.headers.map((header, index) => (
                    <th key={`${header}-${index}`} className="whitespace-nowrap px-3 py-2 font-semibold">
                      {header || `Column ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheet.rows.slice(0, 40).map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`} className="border-t border-white/10">
                    {row.map((cell, cellIndex) => (
                      <td key={`cell-${rowIndex}-${cellIndex}`} className="whitespace-nowrap px-3 py-2 text-white/90">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-white">Oracle Login Sheet</h2>
          <Button onClick={handleOracleDownload}>Download Oracle.xlsx</Button>
        </div>
        <p className="mb-4 text-sm text-white/80">
          Upload Oracle.xlsx to update employee email and NIC mapping used during login.
        </p>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-black/35 p-3">
          <input
            type="file"
            accept=".xlsx"
            onChange={(event) => setOracleUploadFile(event.target.files?.[0] ?? null)}
            className="text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600/85 file:px-3 file:py-2 file:text-white"
          />
          <Button onClick={handleOracleUpload} disabled={oracleUploading || !oracleUploadFile}>
            {oracleUploading ? <Spinner /> : 'Upload Latest Oracle.xlsx'}
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
