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
}

export default new MLApiClient();

