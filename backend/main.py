from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import uvicorn

import models, schemas, database, auth, ai_service
from database import engine

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PrepWise AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(name=user.name, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(database.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/user/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

import json

@app.post("/api/interview/setup")
def setup_interview(request: schemas.InterviewSetupRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Create interview session
    new_session = models.InterviewSession(
        user_id=current_user.id,
        job_role=request.job_role,
        category=request.category,
        difficulty=request.difficulty
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Get first question — no prior questions yet
    first_question = ai_service.generate_interview_question(
        request.job_role, request.category, request.difficulty,
        question_number=1, asked_questions=[]
    )

    return {"session_id": new_session.id, "question": first_question}


@app.post("/api/interview/chat", response_model=schemas.NextTurnResponse)
def submit_interview_chat(request: schemas.InterviewTurnSubmit, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == request.session_id, models.InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.is_completed:
        raise HTTPException(status_code=400, detail="Interview already completed")

    # Evaluate answer
    eval_data = ai_service.evaluate_answer(request.question, request.user_answer)
    
    # Save Turn
    new_turn = models.InterviewTurn(
        session_id=session.id,
        question=request.question,
        user_answer=request.user_answer,
        score=eval_data["score"],
        evaluation_json=json.dumps(eval_data)
    )
    db.add(new_turn)
    db.commit()
    
    # Calculate progress
    all_turns = db.query(models.InterviewTurn).filter(models.InterviewTurn.session_id == session.id).count()
    
    # Check if this is the end of the interview (10 questions max)
    if all_turns >= 10:
        # Finalize score
        turns = db.query(models.InterviewTurn).filter(models.InterviewTurn.session_id == session.id).all()
        avg_score = sum(t.score for t in turns) / len(turns)
        session.overall_score = round(avg_score)
        session.is_completed = True
        db.commit()
        
        return schemas.NextTurnResponse(
            evaluation=schemas.EvaluationResponse(**eval_data),
            next_question=None,
            is_completed=True
        )

    # Collect all questions already asked to guarantee uniqueness
    existing_turns = db.query(models.InterviewTurn).filter(models.InterviewTurn.session_id == session.id).all()
    asked_questions = [t.question for t in existing_turns]

    # Generate next unique question
    next_q = ai_service.generate_interview_question(
        session.job_role, session.category, session.difficulty,
        question_number=all_turns + 1,
        asked_questions=asked_questions
    )

    return schemas.NextTurnResponse(
        evaluation=schemas.EvaluationResponse(**eval_data),
        next_question=next_q,
        is_completed=False
    )


@app.get("/api/interview/report/{session_id}", response_model=schemas.InterviewReportResponse)
def get_interview_report(session_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id, models.InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    turns = db.query(models.InterviewTurn).filter(models.InterviewTurn.session_id == session_id).all()
    
    return schemas.InterviewReportResponse(
        session=session,
        turns=turns
    )


@app.get("/api/interview/history")
def get_interview_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    sessions = db.query(models.InterviewSession).filter(
        models.InterviewSession.user_id == current_user.id,
        models.InterviewSession.is_completed == True
    ).order_by(models.InterviewSession.date.desc()).all()
    
    return {"history": sessions}


@app.get("/api/user/analytics")
def get_user_analytics(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    sessions = db.query(models.InterviewSession).filter(
        models.InterviewSession.user_id == current_user.id,
        models.InterviewSession.is_completed == True
    ).all()
    
    total_interviews = len(sessions)
    if total_interviews == 0:
        return {
            "total_interviews": 0,
            "average_score": 0,
            "best_category": "N/A",
            "trend_data": [],
            "category_data": []
        }
        
    category_stats = {}
    trend_data = []
    total_score_sum = 0
    
    for s in sessions:
        total_score_sum += s.overall_score
        cat = s.category
        
        if cat not in category_stats:
            category_stats[cat] = {"total_score": 0, "count": 0}
            
        category_stats[cat]["total_score"] += s.overall_score
        category_stats[cat]["count"] += 1
        
        trend_data.append({
            "date": s.date.strftime("%Y-%m-%d"),
            "score": s.overall_score,
            "category": s.category
        })
        
    global_average = round(total_score_sum / total_interviews, 1)
    
    best_category = "N/A"
    best_avg = -1
    chart_category_data = []
    
    for cat, stats in category_stats.items():
        avg = round(stats["total_score"] / stats["count"], 1)
        if avg > best_avg:
            best_avg = avg
            best_category = cat
            
        chart_category_data.append({
            "name": cat,
            "average_score": avg
        })
        
    return {
        "total_interviews": total_interviews,
        "average_score": global_average,
        "best_category": best_category,
        "trend_data": trend_data,
        "category_data": chart_category_data
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
