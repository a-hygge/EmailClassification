"""
Pydantic models for request and response validation
"""
from pydantic import BaseModel, Field, field_validator


class ClassifyRequest(BaseModel):
    """Request model for email classification"""
    title: str = Field(..., min_length=1, max_length=500, description="Email title/subject")
    content: str = Field(..., min_length=1, max_length=10000, description="Email content/body")
    
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

