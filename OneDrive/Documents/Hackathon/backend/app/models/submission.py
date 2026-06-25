import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import SubmissionStatus

if TYPE_CHECKING:
    from app.models.registration import Registration
    from app.models.problem_statement import ProblemStatement

class Submission(Base):
    __tablename__ = "submissions"

    registration_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("registrations.id", ondelete="CASCADE"), unique=True)
    problem_statement_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("problem_statements.id", ondelete="RESTRICT"))
    repository_url: Mapped[str | None] = mapped_column(String)
    presentation_url: Mapped[str | None] = mapped_column(String)
    status: Mapped[SubmissionStatus] = mapped_column(default=SubmissionStatus.DRAFT)

    # Relationships
    registration: Mapped["Registration"] = relationship(back_populates="submission")
    problem_statement: Mapped["ProblemStatement"] = relationship(back_populates="submissions")
