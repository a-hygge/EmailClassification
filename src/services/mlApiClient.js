/**
 * ML API Client
 * Service to communicate with the Python FastAPI ML service
 */
import config from '../config/config.js';

class MLApiClient {
  /**
   * Predict email classification
   * @param {Object} emailData - Email data to classify
   * @param {string} emailData.title - Email title/subject
   * @param {string} emailData.content - Email content/body
   * @returns {Promise<Object>} Classification result
   */
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `ML API request failed: ${response.status} - ${errorData.detail || 'Unknown error'}`
        );
      }

      const data = await response.json();
      
      return {
        labelId: data.label_id,
        labelName: data.label,
        confidence: data.confidence
      };
      
    } catch (error) {
      console.error('ML API error:', error);
      
      // Fallback: return default label (you can customize this)
      return {
        labelId: null,
        labelName: 'Unclassified',
        confidence: 0
      };
    }
  }

  /**
   * Check if ML service is healthy
   * @returns {Promise<boolean>} True if service is healthy
   */
  async healthCheck() {
    try {
      const response = await fetch(`${config.pythonML.url}/health`);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.status === 'healthy' && data.model_loaded === true;
      
    } catch (error) {
      console.error('ML service health check failed:', error);
      return false;
    }
  }

  /**
   * Get model information
   * @returns {Promise<Object>} Model metadata
   */
  async getModelInfo() {
    try {
      const response = await fetch(`${config.pythonML.url}/api/v1/model/info`);

      if (!response.ok) {
        throw new Error('Failed to get model info');
      }

      return await response.json();

    } catch (error) {
      console.error('Failed to get model info:', error);
      return null;
    }
  }

  /**
   * Start model retraining
   * @param {Object} trainingRequest - Training configuration
   * @returns {Promise<Object>} Training job information
   */
  async startRetraining(trainingRequest) {
    try {
      console.log('🔄 Starting retraining with config:', trainingRequest);

      const response = await fetch(`${config.pythonML.url}/api/v1/retrain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.pythonML.apiKey
        },
        body: JSON.stringify(trainingRequest)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to start retraining');
      }

      const result = await response.json();
      console.log('✅ Retraining started:', result);
      return result;
    } catch (error) {
      console.error('ML API startRetraining error:', error);
      throw error;
    }
  }

  /**
   * Get retraining status
   * @param {string} jobId - Training job ID
   * @returns {Promise<Object>} Training status
   */
  async getRetrainingStatus(jobId) {
    try {
      console.log(`📊 Getting status for job: ${jobId}`);

      const response = await fetch(`${config.pythonML.url}/api/v1/retrain/status/${jobId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': config.pythonML.apiKey
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get training status');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('ML API getRetrainingStatus error:', error);
      throw error;
    }
  }

  /**
   * Get retraining results
   * @param {string} jobId - Training job ID
   * @returns {Promise<Object>} Training results with metrics and history
   */
  async getRetrainingResults(jobId) {
    try {
      console.log(`📈 Getting results for job: ${jobId}`);

      const response = await fetch(`${config.pythonML.url}/api/v1/retrain/results/${jobId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': config.pythonML.apiKey
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get training results');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('ML API getRetrainingResults error:', error);
      throw error;
    }
  }

  /**
   * Save retrained model
   * @param {string} jobId - Training job ID
   * @param {string} modelName - Name for the saved model
   * @returns {Promise<Object>} Save result with model path
   */
  async saveRetrainedModel(jobId, modelName) {
    try {
      console.log(`💾 Saving model for job: ${jobId} as ${modelName}`);

      const response = await fetch(`${config.pythonML.url}/api/v1/retrain/save/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.pythonML.apiKey
        },
        body: JSON.stringify({ modelName })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save model');
      }

      const result = await response.json();
      console.log('✅ Model saved:', result);
      return result;
    } catch (error) {
      console.error('ML API saveRetrainedModel error:', error);
      throw error;
    }
  }
}

export default new MLApiClient();

