/**
 * TrainingJob DAO (Data Access Object)
 * Handles all database operations related to Training Jobs
 */
import db from '../models/index.js';

const { TrainingJob } = db;

class TrainingJobDao {
  /**
   * Create a new training job
   */
  async create(jobData) {
    try {
      const job = await TrainingJob.create(jobData);
      return job;
    } catch (error) {
      console.error('Error creating training job:', error);
      throw error;
    }
  }

  /**
   * Find training job by ID
   */
  async findById(id) {
    try {
      const job = await TrainingJob.findByPk(id);
      return job;
    } catch (error) {
      console.error('Error finding training job:', error);
      throw error;
    }
  }

  /**
   * Update training job
   */
  async update(id, updateData) {
    try {
      const job = await TrainingJob.findByPk(id);
      if (!job) return null;
      await job.update(updateData);
      return job;
    } catch (error) {
      console.error('Error updating training job:', error);
      throw error;
    }
  }

  /**
   * Get user's training history
   */
  async findByUserId(userId, options = {}) {
    try {
      const jobs = await TrainingJob.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
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

