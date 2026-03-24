@echo off
echo ==============================================
echo Starting PrepWise AI - Interview Practice Platform
echo ==============================================

echo Starting FastAPI Backend...
start cmd /k "cd backend && .\venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Vite Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Frontend will be available at http://localhost:5173
echo Backend API is running on http://localhost:8000
echo ==============================================