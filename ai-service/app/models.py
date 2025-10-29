"""
Pydantic models for request and response validation
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator


class ClassifyRequest(BaseModel):
    """Request model for email classification"""
    title: str = Field(..., min_length=1, max_length=500, description="Email title/subject")
    content: str = Field(..., min_length=1, description="Email content/body")

    @field_validator('title', 'content')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        """Ensure fields are not just whitespace"""
        if not v or not v.strip():
            raise ValueError('Field cannot be empty or whitespace only')
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Team Meeting Tomorrow",
                "content": "We have a team meeting scheduled for tomorrow at 10 AM in the conference room."
            }
        }


class ClassifyResponse(BaseModel):
    """Response model for email classification"""
    label: str = Field(..., description="Predicted label name")
    label_id: int = Field(..., description="Predicted label ID")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Prediction confidence score")

    class Config:
        json_schema_extra = {
            "example": {
                "label": "Work",
                "label_id": 2,
                "confidence": 0.95
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str = Field(..., description="Service status")
    model_loaded: bool = Field(..., description="Whether ML model is loaded")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "model_loaded": True
            }
        }


class ErrorResponse(BaseModel):
    """Response model for errors"""
    error: str = Field(..., description="Error type")
    detail: str = Field(..., description="Error details")

    class Config:
        json_schema_extra = {
            "example": {
                "error": "ValidationError",
                "detail": "Title cannot be empty"
            }
        }



# ============================================================================
# Retrain Models
# ============================================================================

class TrainingSample(BaseModel):
    """Training sample data"""
    id: int = Field(..., description="Sample ID")
    title: str = Field(..., description="Email title")
    content: str = Field(..., description="Email content")
    label: str = Field(..., description="Label name")
    labelId: int = Field(..., description="Label ID")


class Hyperparameters(BaseModel):
    """Hyperparameters for model training"""
    epochs: int = Field(default=25, ge=1, le=100, description="Number of training epochs")
    batch_size: int = Field(default=32, ge=1, le=256, description="Batch size")
    learning_rate: float = Field(default=0.0001, gt=0, le=1, description="Learning rate")
    max_words: int = Field(default=50000, ge=1000, description="Maximum vocabulary size")
    max_len: int = Field(default=256, ge=50, le=1000, description="Maximum sequence length")

    class Config:
        json_schema_extra = {
            "example": {
                "epochs": 25,
                "batch_size": 32,
                "learning_rate": 0.0001,
                "max_words": 50000,
                "max_len": 256
            }
        }


class RetrainRequest(BaseModel):
    """Request model for retraining"""
    jobId: str = Field(..., description="Training job ID")
    modelType: str = Field(..., description="Model type (RNN, LSTM, BiLSTM, CNN, BiLSTM+CNN)")
    modelPath: Optional[str] = Field(None, description="Path to existing model (optional)")
    samples: List[TrainingSample] = Field(..., min_length=10, description="Training samples")
    hyperparameters: Hyperparameters = Field(..., description="Training hyperparameters")

    @field_validator('modelType')
    @classmethod
    def validate_model_type(cls, v: str) -> str:
        """Validate model type"""
        allowed_types = ['RNN', 'LSTM', 'BiLSTM', 'CNN', 'BiLSTM+CNN']
        if v not in allowed_types:
            raise ValueError(f'Model type must be one of {allowed_types}')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "jobId": "123",
                "modelType": "LSTM",
                "samples": [
                    {
                        "id": 1,
                        "title": "Meeting tomorrow",
                        "content": "We have a team meeting...",
                        "label": "Công việc",
                        "labelId": 1
                    }
                ],
                "hyperparameters": {
                    "epochs": 25,
                    "batch_size": 32,
                    "learning_rate": 0.0001
                }
            }
        }


class RetrainResponse(BaseModel):
    """Response model for retrain start"""
    jobId: str = Field(..., description="Training job ID")
    status: str = Field(..., description="Job status")
    message: str = Field(..., description="Status message")

    class Config:
        json_schema_extra = {
            "example": {
                "jobId": "123",
                "status": "running",
                "message": "Training started successfully"
            }
        }


class TrainingProgress(BaseModel):
    """Training progress information"""
    currentEpoch: int = Field(..., description="Current epoch number")
    totalEpochs: int = Field(..., description="Total number of epochs")
    progress: float = Field(..., ge=0.0, le=100.0, description="Progress percentage")
    currentLoss: Optional[float] = Field(None, description="Current training loss")
    currentAccuracy: Optional[float] = Field(None, description="Current training accuracy")
    valLoss: Optional[float] = Field(None, description="Current validation loss")
    valAccuracy: Optional[float] = Field(None, description="Current validation accuracy")


class TrainingStatusResponse(BaseModel):
    """Response model for training status"""
    jobId: str = Field(..., description="Training job ID")
    status: str = Field(..., description="Job status (pending, running, completed, failed)")
    progress: Optional[TrainingProgress] = Field(None, description="Training progress")
    error: Optional[str] = Field(None, description="Error message if failed")

    class Config:
        json_schema_extra = {
            "example": {
                "jobId": "123",
                "status": "running",
                "progress": {
                    "currentEpoch": 10,
                    "totalEpochs": 25,
                    "progress": 40.0,
                    "currentLoss": 0.5,
                    "currentAccuracy": 0.85,
                    "valLoss": 0.6,
                    "valAccuracy": 0.82
                }
            }
        }


class TrainingMetrics(BaseModel):
    """Training metrics"""
    testLoss: float = Field(..., description="Test loss")
    testAccuracy: float = Field(..., description="Test accuracy")
    classificationReport: Dict[str, Any] = Field(..., description="Classification report")
    confusionMatrix: List[List[int]] = Field(..., description="Confusion matrix")


class TrainingHistory(BaseModel):
    """Training history"""
    loss: List[float] = Field(..., description="Training loss history")
    accuracy: List[float] = Field(..., description="Training accuracy history")
    val_loss: List[float] = Field(..., description="Validation loss history")
    val_accuracy: List[float] = Field(..., description="Validation accuracy history")


class TrainingResultsResponse(BaseModel):
    """Response model for training results"""
    jobId: str = Field(..., description="Training job ID")
    status: str = Field(..., description="Job status")
    metrics: Optional[TrainingMetrics] = Field(None, description="Training metrics")
    history: Optional[TrainingHistory] = Field(None, description="Training history")

    class Config:
        json_schema_extra = {
            "example": {
                "jobId": "123",
                "status": "completed",
                "metrics": {
                    "testLoss": 0.3737,
                    "testAccuracy": 0.9414,
                    "classificationReport": {},
                    "confusionMatrix": []
                },
                "history": {
                    "loss": [1.8, 1.2, 0.8],
                    "accuracy": [0.5, 0.7, 0.85],
                    "val_loss": [1.3, 0.9, 0.7],
                    "val_accuracy": [0.6, 0.75, 0.88]
                }
            }
        }


class SaveModelRequest(BaseModel):
    """Request model for saving trained model"""
    modelName: str = Field(..., min_length=1, max_length=100, description="Name for the saved model")

    class Config:
        json_schema_extra = {
            "example": {
                "modelName": "lstm_model_v2"
            }
        }


class SaveModelResponse(BaseModel):
    """Response model for save model"""
    success: bool = Field(..., description="Whether save was successful")
    modelPath: str = Field(..., description="Path to saved model")
    message: str = Field(..., description="Status message")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "modelPath": "/models/lstm_model_v2.h5",
                "message": "Model saved successfully"
            }
        }

