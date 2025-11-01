/**
 * Model DAO (Data Access Object)
 * Handles all database operations related to ML Models
 */
import db from '../models/index.js';

const { Model, Dataset } = db;

class ModelDao {
  /**
   * Save retrained model to database
   * Khi user ấn save sau khi retrain xong
   * @param {Object} modelData - Model data from training result
   * @param {string} modelData.path - Path to model file (e.g., 'ml_models/email_cnn_model.h5')
   * @param {string} modelData.version - Model version (e.g., '1.0.0', '2.0.0')
   * @param {number} modelData.accuracy - Model accuracy (0-1)
   * @param {number} modelData.precision - Model precision (0-1)
   * @param {number} modelData.recall - Model recall (0-1)
   * @param {number} modelData.f1Score - Model F1 score (0-1)
   * @param {number} modelData.tblDatasetId - Dataset ID used for training (optional)
   * @returns {Promise<Object>} Created model
   */
  async saveRetrainModel(modelData) {
    const transaction = await db.sequelize.transaction();
    try {
      // Deactivate all current models
      await Model.update(
        { isActive: false },
        { 
          where: { isActive: true },
          transaction 
        }
      );

      // Create new model with isActive = true
      const model = await Model.create({
        ...modelData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { transaction });

      await transaction.commit();
      return model;
    } catch (error) {
      await transaction.rollback();
      console.error('Error saving retrain model:', error);
      throw error;
    }
  }

  /**
   * Get active models list
   * @returns {Promise<Array>} Array of active models
   */
  async getModelList() {
    try {
      const models = await Model.findAll({
        include: [
          { model: Dataset, as: 'dataset' }
        ],
        order: [['createdAt', 'DESC']]
      });
      return models;
    } catch (error) {
      console.error('Error getting model list:', error);
      throw error;
    }
  }

  /**
   * Find model by ID
   * @param {number} id - Model ID
   * @returns {Promise<Object|null>} Model object or null
   */
  async findById(id) {
    try {
      const model = await Model.findByPk(id, {
        include: [
          { model: Dataset, as: 'dataset' }
        ]
      });
      return model;
    } catch (error) {
      console.error('Error finding model by ID:', error);
      throw error;
    }
  }

  /**
   * Find all models
   * @returns {Promise<Array>} Array of all models
   */
  async findAll() {
    try {
      const models = await Model.findAll({
        include: [
          { model: Dataset, as: 'dataset' }
        ],
        order: [['createdAt', 'DESC']]
      });
      return models;
    } catch (error) {
      console.error('Error finding all models:', error);
      throw error;
    }
  }

  /**
   * Create a new model
   * @param {Object} modelData - Model data
   * @param {string} modelData.path - Path to model file
   * @param {string} modelData.version - Model version
   * @param {number} modelData.accuracy - Model accuracy (0-1)
   * @param {number} modelData.precision - Model precision (0-1)
   * @param {number} modelData.recall - Model recall (0-1)
   * @param {number} modelData.f1Score - Model F1 score (0-1)
   * @param {boolean} modelData.isActive - Is model active (default: false)
   * @param {number} modelData.tblDatasetId - Dataset ID (optional)
   * @returns {Promise<Object>} Created model
   */
  async create(modelData) {
    try {
      const model = await Model.create(modelData);
      return model;
    } catch (error) {
      console.error('Error creating model:', error);
      throw error;
    }
  }

  /**
   * Update a model
   * @param {number} id - Model ID
   * @param {Object} updateData - Data to update
   * @param {string} updateData.path - Model path (optional)
   * @param {string} updateData.version - Model version (optional)
   * @param {number} updateData.accuracy - Model accuracy (optional)
   * @param {number} updateData.precision - Model precision (optional)
   * @param {number} updateData.recall - Model recall (optional)
   * @param {number} updateData.f1Score - Model F1 score (optional)
   * @param {boolean} updateData.isActive - Is model active (optional)
   * @param {number} updateData.tblDatasetId - Dataset ID (optional)
   * @returns {Promise<Object|null>} Updated model or null
   */
  async update(id, updateData) {
    try {
      const model = await Model.findByPk(id);
      if (!model) return null;
      await model.update(updateData);
      return model;
    } catch (error) {
      console.error('Error updating model:', error);
      throw error;
    }
  }

  /**
   * Delete a model
   * @param {number} id - Model ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    try {
      const model = await Model.findByPk(id);
      if (!model) return false;
      await model.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  }

  /**
   * Get currently active model
   * @returns {Promise<Object|null>} Active model or null
   */
  async getActiveModel() {
    try {
      const model = await Model.findOne({
        where: { isActive: true },
        include: [
          { model: Dataset, as: 'dataset' }
        ]
      });
      return model;
    } catch (error) {
      console.error('Error getting active model:', error);
      throw error;
    }
  }
}

export default new ModelDao();


