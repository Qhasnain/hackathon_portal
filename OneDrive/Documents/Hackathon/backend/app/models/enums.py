from enum import Enum

class UserRole(str, Enum):
    STUDENT = "STUDENT"
    ADMIN = "ADMIN"
    JUDGE = "JUDGE"

class HackathonStatus(str, Enum):
    UPCOMING = "UPCOMING"
    REGISTRATION_OPEN = "REGISTRATION_OPEN"
    SUBMISSION_OPEN = "SUBMISSION_OPEN"
    CLOSED = "CLOSED"

class HackathonMode(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    HYBRID = "HYBRID"

class ProblemDifficulty(str, Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"

class RegistrationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class SubmissionStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
