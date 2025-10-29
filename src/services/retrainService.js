/**
 * Retrain Service
 * Business logic for model retraining
 */
import trainingJobDao from '../dao/trainingJobDao.js';
import emailDao from '../dao/emailDao.js';
import labelDao from '../dao/labelDao.js';
import modelDao from '../dao/modelDao.js';
import mlApiClient from './mlApiClient.js';
import db from '../models/index.js';

class RetrainService {
  /**
   * Validate training configuration
   */
  validateTrainingConfig(config) {
    const { modelId, sampleIds, hyperparameters } = config;

    // Validate model ID
    if (!modelId || isNaN(modelId)) {
      throw new Error('Invalid model ID');
    }

    // Validate sample IDs
    if (!Array.isArray(sampleIds) || sampleIds.length < 10) {
      throw new Error('At least 10 training samples are required');
    }

    // Validate hyperparameters
    const { learning_rate, epochs, batch_size, random_state } = hyperparameters;

    if (learning_rate <= 0 || learning_rate > 1) {
      throw new Error('Learning rate must be between 0 and 1');
    }

    if (epochs < 1 || epochs > 100) {
      throw new Error('Epochs must be between 1 and 100');
    }

    if (batch_size < 1 || batch_size > 256) {
      throw new Error('Batch size must be between 1 and 256');
    }

    return true;
  }

  /**
   * Prepare training data from selected samples
   */
  async prepareTrainingData(sampleIds) {
    try {
      const samples = await emailDao.findAll({
        where: { id: sampleIds },
        include: [{ model: db.Label, as: 'Label' }]
      });

      return samples.map(email => ({
        id: email.id,
        title: email.title,
        content: email.content,
        label: email.Label?.name || 'Unknown',
        labelId: email.labelId
      }));
    } catch (error) {
      console.error('Error preparing training data:', error);
      throw error;
    }
  }

  /**
   * Create training job
   */
  async createTrainingJob(userId, config) {
    try {
      // Fetch model details from database
      const model = await modelDao.findById(config.modelId);
      if (!model) {
        throw new Error('Model not found');
      }

      const jobData = {
        userId,
        modelType: model.version, // Store model version/name
        status: 'pending',
        hyperparameters: config.hyperparameters,
        sampleIds: config.sampleIds
      };

      const job = await trainingJobDao.create(jobData);
      return job;
    } catch (error) {
      console.error('Error creating training job:', error);
      throw error;
    }
  }

  /**
   * Start training process
   */
  async startTraining(userId, config) {
    try {
      // Validate configuration
      this.validateTrainingConfig(config);

      // Prepare training data
      const samples = await this.prepareTrainingData(config.sampleIds);

      // Create training job
      const job = await this.createTrainingJob(userId, config);

      // Fetch model details
      const model = await modelDao.findById(config.modelId);

      // Call AI service to start training
      const trainingRequest = {
        jobId: job.id.toString(),
        modelType: model.version,
        modelPath: model.path,
        samples: samples,
        hyperparameters: config.hyperparameters
      };

      const result = await mlApiClient.startRetraining(trainingRequest);

      // Update job status
      await trainingJobDao.update(job.id, { status: 'running' });

      return {
        success: true,
        jobId: job.id,
        message: 'Training started successfully'
      };
    } catch (error) {
      console.error('Error starting training:', error);
      throw error;
    }
  }

  /**
   * Get training status
   */
  async getTrainingStatus(jobId) {
    try {
      const job = await trainingJobDao.findById(jobId);
      if (!job) {
        throw new Error('Training job not found');
      }

      // Check AI service for status
      const status = await mlApiClient.getRetrainingStatus(jobId.toString());

      // Update job if status changed
      if (status.status !== job.status) {
        await trainingJobDao.update(jobId, { status: status.status });
      }

      // Extract progress info from status.progress object if it exists
      const progressInfo = status.progress || {};

      return {
        success: true,
        jobId: job.id,
        status: status.status,
        progress: progressInfo.progress || 0,
        currentEpoch: progressInfo.currentEpoch || 0,
        totalEpochs: progressInfo.totalEpochs || 0
      };
    } catch (error) {
      console.error('Error getting training status:', error);
      throw error;
    }
  }

  /**
   * Get training results
   */
  async getTrainingResults(jobId) {
    try {
      const job = await trainingJobDao.findById(jobId);
      if (!job) {
        throw new Error('Training job not found');
      }

      if (job.status !== 'completed') {
        throw new Error('Training not completed yet');
      }

      // Get results from AI service
      const results = await mlApiClient.getRetrainingResults(jobId.toString());

      // Update job with results
      await trainingJobDao.update(jobId, { results: results });

      // Transform metrics to match frontend expectations
      const transformedMetrics = {
        accuracy: results.metrics?.testAccuracy || 0,
        precision: this.calculateWeightedAverage(results.metrics?.classificationReport, 'precision'),
        recall: this.calculateWeightedAverage(results.metrics?.classificationReport, 'recall'),
        f1: this.calculateWeightedAverage(results.metrics?.classificationReport, 'f1-score')
      };

      // Transform history to match frontend expectations
      const transformedHistory = {
        train_loss: results.history?.loss || [],
        val_loss: results.history?.val_loss || [],
        train_acc: results.history?.accuracy || [],
        val_acc: results.history?.val_accuracy || []
      };

      return {
        success: true,
        jobId: job.id,
        metrics: transformedMetrics,
        history: transformedHistory,
        rawMetrics: results.metrics, // Keep raw metrics for reference
        rawHistory: results.history
      };
    } catch (error) {
      console.error('Error getting training results:', error);
      throw error;
    }
  }

  /**
   * Calculate weighted average from classification report
   */
  calculateWeightedAverage(classificationReport, metric) {
    if (!classificationReport || !classificationReport['weighted avg']) {
      return 0;
    }
    return classificationReport['weighted avg'][metric] || 0;
  }

  /**
   * Save trained model
   */
  async saveModel(jobId, modelName) {
    try {
      const job = await trainingJobDao.findById(jobId);
      if (!job) {
        throw new Error('Training job not found');
      }

      if (job.status !== 'completed') {
        throw new Error('Cannot save incomplete training');
      }

      // Call AI service to save model
      const result = await mlApiClient.saveRetrainedModel(jobId.toString(), modelName);

      // Update job with model path
      await trainingJobDao.update(jobId, { modelPath: result.modelPath });

      return {
        success: true,
        modelPath: result.modelPath,
        message: 'Model saved successfully'
      };
    } catch (error) {
      console.error('Error saving model:', error);
      throw error;
    }
  }

  /**
   * Get user's training history
   */
  async getUserTrainingHistory(userId, limit = 10) {
    try {
      const jobs = await trainingJobDao.findByUserId(userId, { limit });
      return jobs;
    } catch (error) {
      console.error('Error getting training history:', error);
      throw error;
    }
  }
}

export default new RetrainService();

