from fastapi import APIRouter, HTTPException
from app.models import (
    DependantCreateRequest,
    RecordUpdateRequest,
    SheResponse,
    UserChangeRequestCreateRequest,
    UserNoteCreateRequest,
)
from app.services.excel_service import (
    create_dependant,
    get_records_by_nic,
    submit_change_request,
    submit_dependant_notification,
    submit_user_note,
    split_employee_dependants,
    update_record,
)

router = APIRouter(prefix='/api/she', tags=['she'])


@router.get('/{nic}', response_model=SheResponse)
def she_by_nic(nic: str) -> SheResponse:
    records = get_records_by_nic(nic)
    employee, dependants = split_employee_dependants(records)
    return SheResponse(employee=employee, dependants=dependants)


@router.post('/dependant')
def add_dependant(payload: DependantCreateRequest) -> dict:
    request_payload = payload.model_dump(exclude_none=True)
    user_email = request_payload.pop('userEmail', '').strip() or 'unknown@user.local'
    record_id = create_dependant(request_payload)
    submit_dependant_notification(
        user_email=user_email,
        nic=payload.nic,
        message='New dependant added by user. Please review.',
        target_record_id=record_id,
        payload=request_payload,
        request_type='DEPENDANT_ADD',
    )
    return {'id': record_id}


@router.put('/{record_id}')
def put_she_record(record_id: str, payload: RecordUpdateRequest) -> dict:
    request_payload = payload.model_dump(exclude_none=True)
    user_email = request_payload.pop('userEmail', '').strip() or 'unknown@user.local'
    nic = str(request_payload.get('nic', '')).strip()
    success = update_record(record_id, request_payload)
    if not success:
        raise HTTPException(status_code=404, detail='Record not found.')

    if request_payload:
        submit_dependant_notification(
            user_email=user_email,
            nic=nic,
            message='Dependant details corrected by user. Please review.',
            target_record_id=record_id,
            payload=request_payload,
            request_type='DEPENDANT_UPDATE',
        )

    return {'success': True}


@router.post('/note')
def submit_note(payload: UserNoteCreateRequest) -> dict:
    note_id = submit_user_note(payload.userEmail, payload.nic, payload.message)
    return {'id': note_id}


@router.post('/change-request')
def submit_profile_change_request(payload: UserChangeRequestCreateRequest) -> dict:
    note_id = submit_change_request(
        user_email=payload.userEmail,
        nic=payload.nic,
        target_record_id=payload.targetRecordId,
        changes=payload.changes,
    )
    return {'id': note_id}
