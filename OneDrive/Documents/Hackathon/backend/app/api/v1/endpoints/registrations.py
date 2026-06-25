import uuid
from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, Path

from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_admin, get_current_user
from app.models.user import User
from app.models.enums import RegistrationStatus
from app.schemas.registration import (
    RegistrationCreate,
    RegistrationUpdate,
    RegistrationResponse,
    RegistrationListResponse,
)
from app.services.registration_service import registration_service

router = APIRouter()

@router.get("", response_model=RegistrationListResponse)
def get_all_registrations(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_active_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    hackathon_id: Optional[uuid.UUID] = None,
    user_id: Optional[uuid.UUID] = None,
    status: Optional[RegistrationStatus] = None,
) -> Any:
    """
    Retrieve all registrations. Admin only.
    """
    return registration_service.get_all(
        db, 
        page=page, 
        page_size=page_size, 
        search=search, 
        hackathon_id=hackathon_id,
        user_id=user_id,
        status=status,
    )

@router.get("/my", response_model=RegistrationListResponse)
def get_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
) -> Any:
    """
    Retrieve registrations for the currently logged in user.
    """
    return registration_service.get_all(
        db, 
        page=page, 
        page_size=page_size, 
        user_id=current_user.id
    )

@router.post("", response_model=RegistrationResponse)
def create_registration(
    *,
    db: Session = Depends(get_db),
    registration_in: RegistrationCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Register a team for a hackathon.
    """
    return registration_service.create(db, obj_in=registration_in, user_id=current_user.id)

@router.put("/{id}", response_model=RegistrationResponse)
def update_registration(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    registration_in: RegistrationUpdate,
    current_admin=Depends(get_current_active_admin),
) -> Any:
    """
    Update registration status (e.g., APPROVE/REJECT). Admin only.
    """
    registration = registration_service.get(db, id)
    if not registration:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")
    return registration_service.update(db, db_obj=registration, obj_in=registration_in)
