from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    sessions = relationship("InterviewSession", back_populates="user")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_role = Column(String)
    category = Column(String)
    difficulty = Column(String)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    overall_score = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)

    user = relationship("User", back_populates="sessions")
    turns = relationship("InterviewTurn", back_populates="session")


class InterviewTurn(Base):
    __tablename__ = "interview_turns"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    question = Column(String)
    user_answer = Column(String)
    score = Column(Integer)
    evaluation_json = Column(String)

    session = relationship("InterviewSession", back_populates="turns")
