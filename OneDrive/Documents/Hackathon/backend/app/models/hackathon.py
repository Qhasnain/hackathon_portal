import uuid
from typing import TYPE_CHECKING
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import HackathonStatus, HackathonMode

if TYPE_CHECKING:
    from app.models.problem_statement import ProblemStatement
    from app.models.registration import Registration

class Hackathon(Base):
    __tablename__ = "hackathons"

    title: Mapped[str] = mapped_column(String, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    
    registration_start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    registration_end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    submission_deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    
    status: Mapped[HackathonStatus] = mapped_column(default=HackathonStatus.UPCOMING)
    
    max_teams: Mapped[int | None] = mapped_column()
    is_featured: Mapped[bool] = mapped_column(default=False)
    banner_image: Mapped[str | None] = mapped_column(String)
    location: Mapped[str] = mapped_column(String, default="LJ University")
    mode: Mapped[HackathonMode] = mapped_column(default=HackathonMode.OFFLINE)
    
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    # Relationships
    problem_statements: Mapped[list["ProblemStatement"]] = relationship(back_populates="hackathon", cascade="all, delete-orphan")
    registrations: Mapped[list["Registration"]] = relationship(back_populates="hackathon", cascade="all, delete-orphan")
