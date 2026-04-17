from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.models import AdminNote, AdminNoteUpdateRequest, SheetPreviewResponse
from app.services.excel_service import (
    clear_notes,
    delete_note,
    get_oracle_file_path,
    get_she_file_path,
    get_sheet_preview,
    is_admin_email,
    list_notes,
    replace_oracle_file,
    replace_she_file,
    resolve_note,
)

router = APIRouter(prefix='/api/admin', tags=['admin'])


def _guard_admin(email: str) -> None:
    if not is_admin_email(email):
        raise HTTPException(status_code=403, detail='Admin access required.')


@router.get('/notes', response_model=list[AdminNote])
def get_admin_notes(email: str, status: str = 'NEW') -> list[AdminNote]:
    _guard_admin(email)
    return list_notes(status=status)


@router.put('/notes/{note_id}')
def update_admin_note(note_id: str, payload: AdminNoteUpdateRequest) -> dict:
    _guard_admin(payload.adminEmail)
    success = resolve_note(
        note_id=note_id,
        admin_email=payload.adminEmail,
        status=payload.status,
        admin_comment=payload.adminComment or '',
        apply_to_sheet=payload.applyToSheet,
    )
    if not success:
        raise HTTPException(status_code=404, detail='Note not found.')
    return {'success': True}


@router.delete('/notes/{note_id}')
def delete_admin_note(note_id: str, email: str) -> dict:
    _guard_admin(email)
    success = delete_note(note_id)
    if not success:
        raise HTTPException(status_code=404, detail='Note not found.')
    return {'success': True}


@router.delete('/notes')
def clear_admin_notes(email: str, status: str = 'RESOLVED') -> dict:
    _guard_admin(email)
    removed = clear_notes(status=status)
    return {'success': True, 'removed': removed}


@router.get('/sheet-preview', response_model=SheetPreviewResponse)
def preview_sheet(email: str, limit: int = 80) -> SheetPreviewResponse:
    _guard_admin(email)
    data = get_sheet_preview(limit=limit)
    return SheetPreviewResponse(headers=data['headers'], rows=data['rows'])


@router.get('/download/she')
def download_she_sheet(email: str) -> FileResponse:
    _guard_admin(email)
    she_path = get_she_file_path()
    return FileResponse(path=she_path, filename='SHE.xlsx', media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


@router.get('/download/oracle')
def download_oracle_sheet(email: str) -> FileResponse:
    _guard_admin(email)
    oracle_path = get_oracle_file_path()
    return FileResponse(path=oracle_path, filename='Oracle.xlsx', media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


@router.post('/upload/she')
async def upload_she_sheet(email: str = Form(...), file: UploadFile = File(...)) -> dict:
    _guard_admin(email)

    filename = (file.filename or '').lower()
    if not filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail='Please upload a .xlsx file.')

    with NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)

    try:
        replace_she_file(tmp_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f'Invalid or unreadable Excel file: {exc}') from exc
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
        except OSError:
            pass

    return {'success': True}


@router.post('/upload/oracle')
async def upload_oracle_sheet(email: str = Form(...), file: UploadFile = File(...)) -> dict:
    _guard_admin(email)

    filename = (file.filename or '').lower()
    if not filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail='Please upload a .xlsx file.')

    with NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)

    try:
        replace_oracle_file(tmp_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f'Invalid or unreadable Excel file: {exc}') from exc
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
        except OSError:
            pass

    return {'success': True}
