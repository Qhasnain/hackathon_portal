from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.enums import RegistrationStatus

class RegistrationBase(BaseModel):
    team_name: str = Field(..., min_length=3, max_length=50)

class RegistrationCreate(RegistrationBase):
    hackathon_id: UUID
    problem_statement_id: UUID

class RegistrationUpdate(BaseModel):
    status: RegistrationStatus

class RegistrationResponse(RegistrationBase):
    id: UUID
    hackathon_id: UUID
    user_id: UUID
    status: RegistrationStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RegistrationListResponse(BaseModel):
    items: list[RegistrationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
