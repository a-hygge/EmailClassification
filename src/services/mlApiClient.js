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
      // TODO: Implement actual API call to Python service
      // const response = await fetch(`${config.pythonML.url}/api/v1/retrain`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'X-API-Key': config.pythonML.apiKey
      //   },
      //   body: JSON.stringify(trainingRequest)
      // });

      // For now, return mock data
      console.log('🔄 [MOCK] Starting retraining with config:', trainingRequest);

      return {
        jobId: trainingRequest.jobId,
        status: 'pending',
        message: 'Training job created (mock)'
      };
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
      // TODO: Implement actual API call
      // const response = await fetch(`${config.pythonML.url}/api/v1/retrain/status/${jobId}`, {
      //   method: 'GET',
      //   headers: {
      //     'X-API-Key': config.pythonML.apiKey
      //   }
      // });

      // For now, return mock data
      console.log(`📊 [MOCK] Getting status for job: ${jobId}`);

      // Simulate completed training for demo
      return {
        jobId,
        status: 'completed',
        progress: 100,
        currentEpoch: 10,
        totalEpochs: 10
      };
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
      // TODO: Implement actual API call
      // const response = await fetch(`${config.pythonML.url}/api/v1/retrain/results/${jobId}`, {
      //   method: 'GET',
      //   headers: {
      //     'X-API-Key': config.pythonML.apiKey
      //   }
      // });

      // For now, return mock data
      console.log(`📈 [MOCK] Getting results for job: ${jobId}`);

      return {
        jobId,
        metrics: {
          accuracy: 0.92,
          precision: 0.89,
          recall: 0.91,
          f1: 0.90
        },
        history: {
          train_loss: [0.5, 0.4, 0.35, 0.3, 0.25, 0.22, 0.20, 0.18, 0.16, 0.15],
          val_loss: [0.55, 0.45, 0.40, 0.35, 0.30, 0.27, 0.25, 0.23, 0.21, 0.20],
          train_acc: [0.70, 0.75, 0.78, 0.82, 0.85, 0.87, 0.89, 0.90, 0.91, 0.92],
          val_acc: [0.68, 0.73, 0.76, 0.80, 0.83, 0.85, 0.87, 0.88, 0.89, 0.90]
        }
      };
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
      // TODO: Implement actual API call
      // const response = await fetch(`${config.pythonML.url}/api/v1/retrain/save/${jobId}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'X-API-Key': config.pythonML.apiKey
      //   },
      //   body: JSON.stringify({ modelName })
      // });

      // For now, return mock data
      console.log(`💾 [MOCK] Saving model for job: ${jobId} as ${modelName}`);

      return {
        success: true,
        modelPath: `/models/${modelName}_${Date.now()}.h5`,
        message: 'Model saved successfully (mock)'
      };
    } catch (error) {
      console.error('ML API saveRetrainedModel error:', error);
      throw error;
    }
  }
}

export default new MLApiClient();

