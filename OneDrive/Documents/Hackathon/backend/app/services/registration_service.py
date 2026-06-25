import uuid
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.registration import Registration
from app.models.submission import Submission
from app.models.hackathon import Hackathon
from app.models.problem_statement import ProblemStatement
from app.models.enums import RegistrationStatus, HackathonStatus, SubmissionStatus
from app.schemas.registration import RegistrationCreate, RegistrationUpdate, RegistrationListResponse

class RegistrationService:
    def get(self, db: Session, id: uuid.UUID) -> Optional[Registration]:
        return db.execute(select(Registration).where(Registration.id == id)).scalar_one_or_none()

    def get_by_user_and_hackathon(self, db: Session, user_id: uuid.UUID, hackathon_id: uuid.UUID) -> Optional[Registration]:
        return db.execute(
            select(Registration).where(
                Registration.user_id == user_id,
                Registration.hackathon_id == hackathon_id
            )
        ).scalar_one_or_none()

    def create(self, db: Session, *, obj_in: RegistrationCreate, user_id: uuid.UUID) -> Registration:
        # 1. Validate Hackathon
        hackathon = db.execute(select(Hackathon).where(Hackathon.id == obj_in.hackathon_id)).scalar_one_or_none()
        if not hackathon:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hackathon not found")
        
        now = datetime.now(timezone.utc)
        if now < hackathon.registration_start_date or now > hackathon.registration_end_date:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hackathon registration is closed")

        # 2. Check maximum teams
        if hackathon.max_teams is not None:
            team_count = db.execute(select(func.count(Registration.id)).where(Registration.hackathon_id == hackathon.id)).scalar()
            if team_count >= hackathon.max_teams:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hackathon has reached maximum team capacity")

        # 3. Validate Problem Statement
        problem = db.execute(select(ProblemStatement).where(ProblemStatement.id == obj_in.problem_statement_id)).scalar_one_or_none()
        if not problem or problem.hackathon_id != obj_in.hackathon_id or not problem.is_published:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or unpublished problem statement")

        # 4. Check for duplicate registration
        if self.get_by_user_and_hackathon(db, user_id, obj_in.hackathon_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already registered for this hackathon")

        # 5. Create Registration
        db_obj = Registration(
            hackathon_id=obj_in.hackathon_id,
            user_id=user_id,
            team_name=obj_in.team_name,
            status=RegistrationStatus.APPROVED  # Auto-approve for simplicity, or PENDING if manual approval needed
        )
        db.add(db_obj)
        db.flush() # flush to get db_obj.id

        # 6. Create Draft Submission
        db_sub = Submission(
            registration_id=db_obj.id,
            problem_statement_id=obj_in.problem_statement_id,
            status=SubmissionStatus.DRAFT
        )
        db.add(db_sub)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Registration, obj_in: RegistrationUpdate) -> Registration:
        db_obj.status = obj_in.status
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_all(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        hackathon_id: Optional[uuid.UUID] = None,
        user_id: Optional[uuid.UUID] = None,
        status: Optional[RegistrationStatus] = None
    ) -> RegistrationListResponse:
        query = select(Registration)

        if search:
            query = query.filter(Registration.team_name.ilike(f"%{search}%"))
        
        if hackathon_id:
            query = query.filter(Registration.hackathon_id == hackathon_id)
            
        if user_id:
            query = query.filter(Registration.user_id == user_id)
            
        if status:
            query = query.filter(Registration.status == status)

        query = query.order_by(desc(Registration.created_at))

        total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
        
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        items = db.execute(query).scalars().all()
        total_pages = (total + page_size - 1) // page_size if total > 0 else 1

        return RegistrationListResponse(
            items=list(items),
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

registration_service = RegistrationService()
