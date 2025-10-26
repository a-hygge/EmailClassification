@echo off
REM Start script for FastAPI ML Service (Windows)
REM This script activates the virtual environment and starts the server

echo ==================================================
echo   Starting Email Classification ML Service
echo ==================================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo ❌ Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then run: venv\Scripts\activate ^&^& pip install -r requirements.txt
    exit /b 1
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Start the server
echo 🚀 Starting FastAPI server...
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

