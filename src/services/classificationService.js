/**
 * Classification Service
 * Handles email classification logic
 */
import db from '../models/index.js';
import mlApiClient from './mlApiClient.js';

const { Email, Label } = db;

class ClassificationService {
  /**
   * Classify a single email using ML API
   * @param {Object} emailData - Email data
   * @param {string} emailData.title - Email title
   * @param {string} emailData.content - Email content
   * @returns {Promise<Object>} Classification result
   */
  async classifyEmail(emailData) {
    try {
      // Validate input
      if (!emailData.title || !emailData.content) {
        throw new Error('Title and content are required');
      }

      // Call ML API
      const prediction = await mlApiClient.predict({
        title: emailData.title,
        content: emailData.content
      });

      // IMPORTANT: Map ML model's label name to database Label ID
      // The ML model returns label_id (0-6 index), but we need the database ID
      let databaseLabelId = null;

      if (prediction.labelName) {
        const label = await Label.findOne({
          where: { name: prediction.labelName }
        });

        if (label) {
          databaseLabelId = label.id;
        } else {
          console.warn(`Label "${prediction.labelName}" not found in database`);
        }
      }

      return {
        success: true,
        labelId: databaseLabelId,  // Database Label.id
        labelName: prediction.labelName,  // Label name from ML model
        mlLabelId: prediction.labelId,  // ML model's label_id (0-6)
        confidence: prediction.confidence
      };

    } catch (error) {
      console.error('Classification error:', error);
      return {
        success: false,
        error: error.message,
        labelId: null,
        confidence: 0
      };
    }
  }

  /**
   * Classify and update email in database
   * @param {number} emailId - Email ID to classify
   * @returns {Promise<Object>} Classification result
   */
  async classifyAndUpdate(emailId) {
    try {
      // Get email from database
      const email = await Email.findByPk(emailId);
      
      if (!email) {
        throw new Error('Email not found');
      }

      // Classify email
      const result = await this.classifyEmail({
        title: email.title,
        content: email.content
      });

      // Update email with classification result if successful
      if (result.success && result.labelId) {
        await email.update({ labelId: result.labelId });
      }

      return result;
      
    } catch (error) {
      console.error('Classify and update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Batch classify multiple emails
   * @param {Array<number>} emailIds - Array of email IDs
   * @returns {Promise<Array>} Array of classification results
   */
  async classifyBatch(emailIds) {
    const results = [];
    
    for (const emailId of emailIds) {
      const result = await this.classifyAndUpdate(emailId);
      results.push({ emailId, ...result });
    }
    
    return results;
  }

  /**
   * Re-classify an email (manual trigger)
   * @param {number} emailId - Email ID to re-classify
   * @returns {Promise<Object>} Classification result
   */
  async reclassifyEmail(emailId) {
    return this.classifyAndUpdate(emailId);
  }

  /**
   * Check if ML service is available
   * @returns {Promise<boolean>} True if service is available
   */
  async isServiceAvailable() {
    return await mlApiClient.healthCheck();
  }
}

export default new ClassificationService();

