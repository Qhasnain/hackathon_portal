from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.enums import SubmissionStatus

class SubmissionBase(BaseModel):
    repository_url: Optional[str] = Field(None, max_length=2048)
    presentation_url: Optional[str] = Field(None, max_length=2048)

class SubmissionCreate(SubmissionBase):
    pass  # We don't create it manually from API; it's created during registration

class SubmissionUpdate(SubmissionBase):
    pass

class SubmissionAdminUpdate(BaseModel):
    status: SubmissionStatus

class SubmissionResponse(SubmissionBase):
    id: UUID
    registration_id: UUID
    problem_statement_id: UUID
    status: SubmissionStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SubmissionListResponse(BaseModel):
    items: list[SubmissionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
