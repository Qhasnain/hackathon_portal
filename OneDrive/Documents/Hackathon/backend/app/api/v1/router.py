from fastapi import APIRouter

from app.api.v1.endpoints import health, metadata, auth, dashboard, hackathons, problem_statements, registrations, submissions, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(hackathons.router, prefix="/hackathons", tags=["hackathons"])
api_router.include_router(problem_statements.router, prefix="/problem-statements", tags=["problem statements"])
api_router.include_router(registrations.router, prefix="/registrations", tags=["registrations"])
api_router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
api_router.include_router(health.router)
api_router.include_router(metadata.router)
