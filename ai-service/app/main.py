"""
FastAPI Email Classification Service
Simple API to serve ML model for email classification
"""
import os
from typing import Dict
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.models import ClassifyRequest, ClassifyResponse, HealthResponse, ErrorResponse
from app.ml_service import MLService

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Email Classification API",
    description="ML-powered email classification service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration - allow requests from Node.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML service (loads model on startup)
ml_service = MLService()

# API Key from environment
API_KEY = os.getenv('API_KEY', 'dev-secret-key-12345')


def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")) -> str:
    """
    Verify API key from request header
    
    Args:
        x_api_key: API key from X-API-Key header
        
    Returns:
        API key if valid
        
    Raises:
        HTTPException: If API key is invalid
    """
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key"
        )
    return x_api_key


@app.get("/", tags=["Root"])
async def root() -> Dict[str, str]:
    """Root endpoint - API information"""
    return {
        "message": "Email Classification API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    
    Returns:
        Service health status and model loading status
    """
    return HealthResponse(
        status="healthy" if ml_service.is_model_loaded() else "unhealthy",
        model_loaded=ml_service.is_model_loaded()
    )


@app.post(
    "/api/v1/classify",
    response_model=ClassifyResponse,
    responses={
        200: {"model": ClassifyResponse},
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    tags=["Classification"],
    dependencies=[Depends(verify_api_key)]
)
async def classify_email(request: ClassifyRequest) -> ClassifyResponse:
    """
    Classify an email into predefined categories
    
    Args:
        request: Email classification request with title and content
        
    Returns:
        Classification result with label, label_id, and confidence
        
    Raises:
        HTTPException: If classification fails
    """
    try:
        # Perform prediction
        label_name, label_id, confidence = ml_service.predict(
            title=request.title,
            content=request.content
        )
        
        return ClassifyResponse(
            label=label_name,
            label_id=label_id,
            confidence=confidence
        )
        
    except RuntimeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Model prediction failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/api/v1/model/info", tags=["Model"])
async def get_model_info() -> Dict:
    """
    Get model metadata and information
    
    Returns:
        Model configuration and metadata
    """
    return ml_service.get_model_info()


# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print("=" * 50)
    print("🚀 Starting Email Classification API")
    print("=" * 50)
    if ml_service.is_model_loaded():
        print("✅ ML Model loaded successfully")
    else:
        print("❌ ML Model failed to load")
    print("=" * 50)


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    print("=" * 50)
    print("👋 Shutting down Email Classification API")
    print("=" * 50)


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv('PORT', 8000))
    host = os.getenv('HOST', '0.0.0.0')
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True
    )

