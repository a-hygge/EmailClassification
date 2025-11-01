"""
FastAPI Email Classification Service
Simple API to serve ML model for email classification
"""

import os
import threading
from typing import Dict
from fastapi import FastAPI, HTTPException, Header, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.models import (
    ClassifyRequest,
    ClassifyResponse,
    HealthResponse,
    ErrorResponse,
    RetrainRequest,
    RetrainResponse,
    TrainingStatusResponse,
    TrainingResultsResponse,
    SaveModelRequest,
    SaveModelResponse,
)
from app.ml_service import MLService
from app.training_manager import TrainingJobManager
from app.training_service import TrainingService
from content_size_limit_asgi import ContentSizeLimitMiddleware

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Email Classification API",
    description="ML-powered email classification service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration - allow requests from Node.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(ContentSizeLimitMiddleware, max_content_size=104857600000)

# Initialize ML service (loads model on startup)
ml_service = MLService()

# Initialize training manager and service
training_manager = TrainingJobManager()
training_service = TrainingService(training_manager)

# API Key from environment
API_KEY = os.getenv("API_KEY", "dev-secret-key-12345")


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
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return x_api_key


@app.get("/", tags=["Root"])
async def root() -> Dict[str, str]:
    """Root endpoint - API information"""
    return {
        "message": "Email Classification API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
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
        model_loaded=ml_service.is_model_loaded(),
    )


@app.post(
    "/api/v1/classify",
    response_model=ClassifyResponse,
    responses={
        200: {"model": ClassifyResponse},
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    tags=["Classification"],
    dependencies=[Depends(verify_api_key)],
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
            title=request.title, content=request.content
        )

        return ClassifyResponse(
            label=label_name, label_id=label_id, confidence=confidence
        )

    except RuntimeError as e:
        raise HTTPException(
            status_code=500, detail=f"Model prediction failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/v1/model/info", tags=["Model"])
async def get_model_info() -> Dict:
    """
    Get model metadata and information

    Returns:
        Model configuration and metadata
    """
    return ml_service.get_model_info()


# ============================================================================
# Retrain Endpoints
# ============================================================================


def run_training_in_background(
    job_id: str, model_type: str, samples: list, hyperparameters: dict
):
    """Run training in background thread"""
    try:
        training_service.train_model(
            job_id=job_id,
            model_type=model_type,
            samples=samples,
            hyperparameters=hyperparameters,
        )
    except Exception as e:
        print(f"❌ Background training failed: {str(e)}")


@app.post(
    "/api/v1/retrain",
    response_model=RetrainResponse,
    tags=["Retrain"],
    dependencies=[Depends(verify_api_key)],
)
async def start_retraining(
    request: RetrainRequest, background_tasks: BackgroundTasks
) -> RetrainResponse:
    """
    Start model retraining

    Args:
        request: Retrain request with job ID, model type, samples, and hyperparameters
        background_tasks: FastAPI background tasks

    Returns:
        Retrain response with job ID and status

    Raises:
        HTTPException: If retraining fails to start
    """
    try:
        print(f"🔄 Received retrain request for job {request.jobId}")
        print(f"   Model type: {request.modelType}")
        print(f"   Samples: {len(request.samples)}")

        # Create job
        training_manager.create_job(request.jobId, request.modelType)

        # Convert samples to dict
        samples = [sample.model_dump() for sample in request.samples]
        hyperparameters = request.hyperparameters.model_dump()

        # Start training in background thread (not blocking)
        thread = threading.Thread(
            target=run_training_in_background,
            args=(request.jobId, request.modelType, samples, hyperparameters),
        )
        thread.daemon = True
        thread.start()

        return RetrainResponse(
            jobId=request.jobId,
            status="running",
            message="Training started successfully",
        )

    except Exception as e:
        print(f"❌ Failed to start retraining: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to start retraining: {str(e)}"
        )


@app.get(
    "/api/v1/retrain/status/{jobId}",
    response_model=TrainingStatusResponse,
    tags=["Retrain"],
    dependencies=[Depends(verify_api_key)],
)
async def get_training_status(jobId: str) -> TrainingStatusResponse:
    """
    Get training job status

    Args:
        jobId: Training job ID

    Returns:
        Training status with progress information

    Raises:
        HTTPException: If job not found
    """
    try:
        status = training_manager.get_job_status(jobId)

        if not status:
            raise HTTPException(status_code=404, detail=f"Job {jobId} not found")

        return TrainingStatusResponse(**status)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get training status: {str(e)}"
        )


@app.get(
    "/api/v1/retrain/results/{jobId}",
    response_model=TrainingResultsResponse,
    tags=["Retrain"],
    dependencies=[Depends(verify_api_key)],
)
async def get_training_results(jobId: str) -> TrainingResultsResponse:
    """
    Get training job results

    Args:
        jobId: Training job ID

    Returns:
        Training results with metrics and history

    Raises:
        HTTPException: If job not found or not completed
    """
    try:
        results = training_manager.get_job_results(jobId)

        if not results:
            job = training_manager.get_job(jobId)
            if not job:
                raise HTTPException(status_code=404, detail=f"Job {jobId} not found")
            elif job["status"] != "completed":
                raise HTTPException(
                    status_code=400,
                    detail=f"Job {jobId} not completed yet (status: {job['status']})",
                )

        return TrainingResultsResponse(**results)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get training results: {str(e)}"
        )


@app.post(
    "/api/v1/retrain/save/{jobId}",
    response_model=SaveModelResponse,
    tags=["Retrain"],
    dependencies=[Depends(verify_api_key)],
)
async def save_trained_model(
    jobId: str, request: SaveModelRequest
) -> SaveModelResponse:
    """
    Save trained model

    Args:
        jobId: Training job ID
        request: Save model request with model name

    Returns:
        Save model response with model path

    Raises:
        HTTPException: If job not found or save fails
    """
    try:
        print(f"💾 Saving model for job {jobId} as {request.modelName}")

        model_path = training_service.save_model(
            job_id=jobId, model_name=request.modelName
        )

        return SaveModelResponse(
            success=True, modelPath=model_path, message="Model saved successfully"
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save model: {str(e)}")


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

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    uvicorn.run("app.main:app", host=host, port=port, reload=True)
