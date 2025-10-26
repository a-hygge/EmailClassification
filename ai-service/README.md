# Email Classification API

Simple FastAPI service for email classification using a CNN model.

## 📁 Project Structure

```
ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application
│   ├── ml_service.py     # ML prediction logic
│   └── models.py         # Pydantic models
├── ml_models/            # Model artifacts
│   ├── email_cnn_model.h5
│   ├── tokenizer.pkl
│   ├── label_encoder.pkl
│   └── model_metadata.json
├── .env                  # Environment variables
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 🚀 Quick Start

### 1. Setup

First, make sure you have the model files in the correct location:

```bash
# Create ml_models directory if it doesn't exist
mkdir -p ml_models

# Move model files to ml_models/ directory
mv email_cnn_model.h5 ml_models/
mv tokenizer.pkl ml_models/
mv label_encoder.pkl ml_models/
mv model_metadata.json ml_models/
```

### 2. Install Dependencies

```bash
# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

The `.env` file is already created with default values. You can modify it if needed:

```env
API_KEY=dev-secret-key-12345
PORT=8000
HOST=0.0.0.0
```

### 4. Run the Server

```bash
# From the ai-service directory
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:

```bash
python app/main.py
```

The API will be available at: `http://localhost:8000`

## 📚 API Documentation

Once the server is running, you can access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🔌 API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Classify Email

```bash
POST /api/v1/classify
Headers:
  X-API-Key: dev-secret-key-12345
  Content-Type: application/json

Body:
{
  "title": "Team Meeting Tomorrow",
  "content": "We have a team meeting scheduled for tomorrow at 10 AM"
}
```

Response:
```json
{
  "label": "Work",
  "label_id": 2,
  "confidence": 0.95
}
```

### Model Info

```bash
GET /api/v1/model/info
```

Response:
```json
{
  "loaded": true,
  "max_len": 256,
  "num_classes": 7,
  "embedding_dim": 128
}
```

## 🧪 Testing with cURL

```bash
# Health check
curl http://localhost:8000/health

# Classify email
curl -X POST http://localhost:8000/api/v1/classify \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-key-12345" \
  -d '{
    "title": "Invoice Payment",
    "content": "Please find attached the invoice for this month"
  }'
```

## 🔗 Integration with Node.js App

### Update your Node.js .env file:

```env
PYTHON_ML_URL=http://localhost:8000
PYTHON_ML_API_KEY=dev-secret-key-12345
```

### Example Node.js code:

```javascript
// src/services/mlApiClient.js
import config from '../config/config.js';

class MLApiClient {
  async predict(emailData) {
    try {
      const response = await fetch(`${config.pythonML.url}/api/v1/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.pythonML.apiKey
        },
        body: JSON.stringify({
          title: emailData.title,
          content: emailData.content
        })
      });

      if (!response.ok) {
        throw new Error('ML API request failed');
      }

      const data = await response.json();
      return {
        labelId: data.label_id,
        confidence: data.confidence,
        labelName: data.label
      };
    } catch (error) {
      console.error('ML API error:', error);
      // Fallback: return default label
      return {
        labelId: 1,
        confidence: 0,
        labelName: 'Unknown'
      };
    }
  }
}

export default new MLApiClient();
```

## 🐛 Troubleshooting

### Model not loading

Make sure model files are in the correct location:
```bash
ls -la ml_models/
# Should show:
# email_cnn_model.h5
# tokenizer.pkl
# label_encoder.pkl
# model_metadata.json
```

### Port already in use

Change the port in `.env`:
```env
PORT=8001
```

### API Key authentication failing

Make sure you're sending the correct header:
```
X-API-Key: dev-secret-key-12345
```

## 📝 Notes

- The API key is set in `.env` file (default: `dev-secret-key-12345`)
- Model is loaded once on startup and cached in memory
- CORS is enabled for `http://localhost:3000` (your Node.js app)
- All endpoints return JSON responses

