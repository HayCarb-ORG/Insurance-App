from pydantic import BaseModel, Field
from typing import Literal, Optional

Gender = Literal['Male', 'Female', 'Other']
DependantRelation = Literal['Spouse', 'Son', 'Daughter']


class AuthResponse(BaseModel):
    email: str
    nic: str
    isAdmin: bool = False


class SheRecord(BaseModel):
    id: str
    name: str
    nic: str
    dob: str
    gender: Gender
    relation: str
    category: str
    effectiveDate: str
    grade: str
    totalPremium: float
    employeeVoluntaryEnhanceLimit: float = 0
    note: Optional[str] = ''


class SheResponse(BaseModel):
    employee: SheRecord | None
    dependants: list[SheRecord]


class DependantCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    nic: str = Field(min_length=1)
    relation: DependantRelation
    dob: str = Field(min_length=1)
    gender: Gender
    userEmail: Optional[str] = None


class RecordUpdateRequest(BaseModel):
    name: Optional[str] = None
    relation: Optional[DependantRelation] = None
    dob: Optional[str] = None
    gender: Optional[Gender] = None
    category: Optional[str] = None
    effectiveDate: Optional[str] = None
    grade: Optional[str] = None
    totalPremium: Optional[float] = None
    employeeVoluntaryEnhanceLimit: Optional[float] = None
    note: Optional[str] = None
    userEmail: Optional[str] = None


class UserNoteCreateRequest(BaseModel):
    userEmail: str = Field(min_length=3)
    nic: str = Field(min_length=3)
    message: str = Field(min_length=3)


class UserChangeRequestCreateRequest(BaseModel):
    userEmail: str = Field(min_length=3)
    nic: str = Field(min_length=3)
    targetRecordId: str = Field(min_length=3)
    changes: dict = Field(default_factory=dict)


class AdminNote(BaseModel):
    id: str
    timestamp: str
    userEmail: str
    nic: str
    message: str
    status: str
    adminEmail: str = ''
    adminComment: str = ''
    requestType: str = 'NOTE'
    targetRecordId: str = ''
    payloadJson: str = ''


class AdminNoteUpdateRequest(BaseModel):
    adminEmail: str = Field(min_length=3)
    status: str = Field(min_length=3)
    adminComment: Optional[str] = None
    applyToSheet: bool = False


class SheetPreviewResponse(BaseModel):
    headers: list[str]
    rows: list[list[str]]
