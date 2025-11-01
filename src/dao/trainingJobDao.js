/**
 * TrainingJob DAO (Data Access Object)
 * Handles all database operations related to Training Jobs
 */
import db from '../models/index.js';

const { TrainingJob, User } = db;

class TrainingJobDao {
  /**
   * Create a new training job
   * @param {Object} data - Training job data
   * @param {number} data.tblUserId - User ID (required)
   * @param {string} data.modelType - Model type (CNN, RNN, LSTM, BiLSTM, BiLSTM+CNN)
   * @param {string} data.modelPath - Path to saved model file (optional, set after training)
   * @param {string} data.status - Job status (pending, running, completed, failed)
   * @param {string} data.hyperparameters - Hyperparameters as JSON string
   * @param {string} data.result - Training result as JSON string (optional, set after training)
   * @returns {Promise<Object>} Created training job
   */
  async create(data) {
    try {
      const job = await TrainingJob.create(data);
      return job;
    } catch (error) {
      console.error('Error creating training job:', error);
      throw error;
    }
  }

  /**
   * Find training job by ID
   * @param {number} id - Job ID
   * @returns {Promise<Object|null>} Training job or null
   */
  async findById(id) {
    try {
      const job = await TrainingJob.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
        ]
      });
      return job;
    } catch (error) {
      console.error('Error finding training job:', error);
      throw error;
    }
  }

  /**
   * Update training job (jobId and data)
   * Thường dùng để cập nhật status, modelPath, result sau khi training
   * @param {number} jobId - Job ID
   * @param {Object} data - Data to update
   * @param {string} data.status - Job status (running, completed, failed)
   * @param {string} data.modelPath - Path to saved model file
   * @param {string} data.result - Training result as JSON string (accuracy, precision, recall, f1Score, etc.)
   * @returns {Promise<Object|null>} Updated job or null
   */
  async update(jobId, data) {
    try {
      const job = await TrainingJob.findByPk(jobId);
      if (!job) return null;
      
      await job.update(data);
      return job;
    } catch (error) {
      console.error('Error updating training job:', error);
      throw error;
    }
  }

  /**
   * Get user's training history
   * @param {number} userId - User ID
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} Array of training jobs
   */
  async findByUserId(userId, options = {}) {
    try {
      const jobs = await TrainingJob.findAll({
        where: { tblUserId: userId },
        order: [['id', 'DESC']],
        ...options
      });
      return jobs;
    } catch (error) {
      console.error('Error finding training jobs by user:', error);
      throw error;
    }
  }

  /**
   * Delete training job
   * @param {number} id - Job ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    try {
      const job = await TrainingJob.findByPk(id);
      if (!job) return false;
      await job.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting training job:', error);
      throw error;
    }
  }
}

export default new TrainingJobDao();


