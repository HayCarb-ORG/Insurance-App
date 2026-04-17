from fastapi import APIRouter, HTTPException
from app.models import AuthResponse
from app.services.excel_service import get_nic_by_email, is_admin_email

router = APIRouter(prefix='/api/auth', tags=['auth'])


@router.get('/{email}', response_model=AuthResponse)
def auth_by_email(email: str) -> AuthResponse:
    admin_user = is_admin_email(email)
    nic = get_nic_by_email(email)
    if nic is None:
        if not admin_user:
            raise HTTPException(status_code=404, detail='User email not found in Oracle sheet.')
        # Admin can access the app even when not listed in Oracle.xlsx.
        nic = 'ADMIN-0000000000'

    return AuthResponse(email=email, nic=nic, isAdmin=admin_user)
