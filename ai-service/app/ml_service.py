import json
import os
from typing import Tuple, Dict, Any
import joblib 
import numpy as np 
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from .db_helper import get_active_model
class MLService:
    _instance = None
    _model = None
    _tokenizer = None
    _label_encoder = None
    _metadata = None
    _model_loaded = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._model_loaded:
            self.load_model()
            
    def load_model(self) -> None:
        try:
            model_path_from_db = get_active_model()
            if model_path_from_db:
                print(f"Using model from db: {model_path_from_db}")
                model_path = model_path_from_db
            else:
                print("No active model in db")
                model_path = os.getenv('MODEL_PATH','ml_models/email_cnn_model.h5')
            tokenizer_path = os.getenv('TOKENIZER_PATH','ml_models/tokenizer.pkl')
            label_encoder_path = os.getenv('LABEL_ENCODER_PATH','ml_models/label_encoder.pkl')
            metadata_path = os.getenv('METADATA_PATH','ml_models/model_metadata.json')
            
            print(f"Loading model from: {model_path}")
            self._model = load_model(model_path)
            
            self._tokenizer = joblib.load(tokenizer_path)
            self._label_encoder = joblib.load(label_encoder_path)
            with open(metadata_path,'r') as f:
                self._metadata = json.load(f)
            self._model_loaded = True
            print("model loaded success")
        except Exception as e:
            print(f"Error: {str(e)}")
            raise RuntimeError(f"failed to load: {str(e)}")
    def is_model_loaded(self) -> bool:
        return self._model_loaded
    def preprocass_text(self, text: str) -> np.ndarray:
        sequence = self._tokenizer.texts_to_sequences([text])
        max_len = self._metadata.get('max_len', 256)
        padded = pad_sequences(
            sequence,
            maxlen=max_len,
            padding = 'post',
            truncating = 'post'
        )
        return padded
    def predict(self, title:str, content:str) -> Tuple[str, int, float]:
        if not self._model_loaded:
            raise RuntimeError("Model not loaded")
        try:
            combined_text = f"{title} {content}"
            preprocessed = self.preprocass_text(combined_text)
            # mảng xác suất
            probabilities = self._model.predict(preprocessed, verbose=0)
            predicted_idx = np.argmax(probabilities, axis=1)[0]
            confidence = float(np.max(probabilities))

            label_name = self._label_encoder.inverse_transform([predicted_idx])[0]
            label_id = int(predicted_idx)
            
            return label_name, label_id, confidence
        except Exception as e:
            raise RuntimeError(f"Predict fail: {str(e)}")
    def get_model_info(self) -> Dict[str, Any]:
        if not self._model_loaded:
            return {"loaded":False}
        
        return {
            "loaded":True,
            "max_len": self._metadata.get('max_len'),
            "num_classes": self._metadata.get('num_classes'),
            "embedding_dim": self._metadata.get('embedding_dim')
        }