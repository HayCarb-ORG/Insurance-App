from fastapi import APIRouter, HTTPException
from app.models import AuthResponse
from app.services.excel_service import get_nic_by_email, is_admin_email

router = APIRouter(prefix='/api/auth', tags=['auth'])


@router.get('/{email}', response_model=AuthResponse)
def auth_by_email(email: str) -> AuthResponse:
    nic = get_nic_by_email(email)
    if nic is None:
        raise HTTPException(status_code=404, detail='User email not found in Oracle sheet.')

    return AuthResponse(email=email, nic=nic, isAdmin=is_admin_email(email))
