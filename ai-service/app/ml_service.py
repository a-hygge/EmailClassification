"""
ML Service for email classification using CNN model
"""
import json
import os
from typing import Tuple, Dict, Any
import joblib
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences


class MLService:
    """
    Singleton service for ML model predictions
    Loads model once and reuses for all predictions
    """
    _instance = None
    _model = None
    _tokenizer = None
    _label_encoder = None
    _metadata = None
    _model_loaded = False
    
    def __new__(cls):
        """Singleton pattern - only one instance"""
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize service (only loads model once)"""
        if not self._model_loaded:
            self.load_model()
    
    def load_model(self) -> None:
        """Load ML model and related artifacts"""
        try:
            # Get paths from environment or use defaults
            model_path = os.getenv('MODEL_PATH', 'ml_models/email_cnn_model.h5')
            tokenizer_path = os.getenv('TOKENIZER_PATH', 'ml_models/tokenizer.pkl')
            label_encoder_path = os.getenv('LABEL_ENCODER_PATH', 'ml_models/label_encoder.pkl')
            metadata_path = os.getenv('METADATA_PATH', 'ml_models/model_metadata.json')
            
            print(f"Loading model from: {model_path}")
            self._model = load_model(model_path)
            
            print(f"Loading tokenizer from: {tokenizer_path}")
            self._tokenizer = joblib.load(tokenizer_path)
            
            print(f"Loading label encoder from: {label_encoder_path}")
            self._label_encoder = joblib.load(label_encoder_path)
            
            print(f"Loading metadata from: {metadata_path}")
            with open(metadata_path, 'r') as f:
                self._metadata = json.load(f)
            
            self._model_loaded = True
            print("✅ Model loaded successfully!")
            
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            raise RuntimeError(f"Failed to load ML model: {str(e)}")
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded"""
        return self._model_loaded
    
    def preprocess_text(self, text: str) -> np.ndarray:
        """
        Preprocess text for model prediction
        
        Args:
            text: Input text to preprocess
            
        Returns:
            Preprocessed and padded sequence
        """
        # Tokenize text
        sequence = self._tokenizer.texts_to_sequences([text])
        
        # Pad sequence to max_len
        max_len = self._metadata.get('max_len', 256)
        padded = pad_sequences(
            sequence, 
            maxlen=max_len, 
            padding='post', 
            truncating='post'
        )
        
        return padded
    
    def predict(self, title: str, content: str) -> Tuple[str, int, float]:
        """
        Predict email classification
        
        Args:
            title: Email title/subject
            content: Email content/body
            
        Returns:
            Tuple of (label_name, label_id, confidence)
        """
        if not self._model_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        try:
            # Combine title and content
            combined_text = f"{title} {content}"
            
            # Preprocess
            preprocessed = self.preprocess_text(combined_text)
            
            # Predict
            probabilities = self._model.predict(preprocessed, verbose=0)
            
            # Get predicted class
            predicted_idx = np.argmax(probabilities, axis=1)[0]
            confidence = float(np.max(probabilities))
            
            # Decode label
            label_name = self._label_encoder.inverse_transform([predicted_idx])[0]
            label_id = int(predicted_idx)
            
            return label_name, label_id, confidence
            
        except Exception as e:
            print(f"❌ Prediction error: {str(e)}")
            raise RuntimeError(f"Prediction failed: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model metadata information"""
        if not self._model_loaded:
            return {"loaded": False}
        
        return {
            "loaded": True,
            "max_len": self._metadata.get('max_len'),
            "num_classes": self._metadata.get('num_classes'),
            "embedding_dim": self._metadata.get('embedding_dim'),
        }

