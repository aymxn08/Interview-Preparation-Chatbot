from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Interview Schemas
class InterviewSetupRequest(BaseModel):
    job_role: str
    category: str
    difficulty: str

class InterviewTurnSubmit(BaseModel):
    session_id: int
    question: str
    user_answer: str

class EvaluationResponse(BaseModel):
    score: int
    relevance: int
    technical_accuracy: int
    communication_clarity: int
    confidence: int
    strengths: str
    weaknesses: str
    suggested_improvement: str
    ideal_sample_answer: str

class NextTurnResponse(BaseModel):
    evaluation: EvaluationResponse
    next_question: Optional[str] = None
    is_completed: bool

class InterviewSessionResponse(BaseModel):
    id: int
    user_id: int
    job_role: str
    category: str
    difficulty: str
    date: datetime.datetime
    overall_score: int
    is_completed: bool

    class Config:
        from_attributes = True

class InterviewTurnResponse(BaseModel):
    id: int
    session_id: int
    question: str
    user_answer: str
    score: int
    evaluation_json: str

    class Config:
        from_attributes = True

class InterviewReportResponse(BaseModel):
    session: InterviewSessionResponse
    turns: List[InterviewTurnResponse]
