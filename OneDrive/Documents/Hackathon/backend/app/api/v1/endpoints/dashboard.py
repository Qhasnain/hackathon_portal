from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.registration import Registration
from app.models.submission import Submission
from app.api.deps import get_current_active_admin
from app.schemas.response import success_response
from app.models.enums import HackathonStatus

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Get live statistics for the Admin Dashboard.
    """
    total_hackathons = db.execute(select(func.count(Hackathon.id))).scalar_one()
    
    # In this app, Teams might just be unique team_names in registrations, or users with teams.
    # The requirement says "Total Teams". Since users have a `team_name` field, we can count distinct team names.
    total_teams = db.execute(select(func.count(func.distinct(User.team_name))).where(User.team_name.isnot(None))).scalar_one()
    
    total_registrations = db.execute(select(func.count(Registration.id))).scalar_one()
    total_submissions = db.execute(select(func.count(Submission.id))).scalar_one()
    
    upcoming = db.execute(select(func.count(Hackathon.id)).where(Hackathon.status == HackathonStatus.UPCOMING)).scalar_one()
    registration_open = db.execute(select(func.count(Hackathon.id)).where(Hackathon.status == HackathonStatus.REGISTRATION_OPEN)).scalar_one()
    submission_open = db.execute(select(func.count(Hackathon.id)).where(Hackathon.status == HackathonStatus.SUBMISSION_OPEN)).scalar_one()
    closed = db.execute(select(func.count(Hackathon.id)).where(Hackathon.status == HackathonStatus.CLOSED)).scalar_one()

    return success_response(data={
        "total_hackathons": total_hackathons,
        "total_teams": total_teams,
        "total_registrations": total_registrations,
        "total_submissions": total_submissions,
        "status_distribution": {
            "upcoming": upcoming,
            "registration_open": registration_open,
            "submission_open": submission_open,
            "closed": closed
        }
    })
