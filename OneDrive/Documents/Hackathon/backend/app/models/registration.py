import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import RegistrationStatus

if TYPE_CHECKING:
    from app.models.hackathon import Hackathon
    from app.models.user import User
    from app.models.submission import Submission

class Registration(Base):
    __tablename__ = "registrations"
    __table_args__ = (
        UniqueConstraint("hackathon_id", "user_id", name="uq_hackathon_user"),
    )

    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathons.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    team_name: Mapped[str] = mapped_column(String)
    status: Mapped[RegistrationStatus] = mapped_column(default=RegistrationStatus.PENDING)

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship(back_populates="registrations")
    user: Mapped["User"] = relationship(back_populates="registrations")
    submission: Mapped["Submission"] = relationship(back_populates="registration", uselist=False, cascade="all, delete-orphan")
