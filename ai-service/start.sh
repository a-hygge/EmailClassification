#!/bin/bash

# Start script for FastAPI ML Service
# This script activates the virtual environment and starts the server

echo "=================================================="
echo "  Starting Email Classification ML Service"
echo "=================================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python -m venv venv"
    echo "Then run: source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "❌ Dependencies not installed!"
    echo "Please run: pip install -r requirements.txt"
    exit 1
fi

# Start the server
echo "🚀 Starting FastAPI server..."
echo ""
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

