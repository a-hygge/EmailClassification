/**
 * Model DAO (Data Access Object)
 * Handles all database operations related to ML Models
 */
import db from '../models/index.js';

const { Model } = db;

class ModelDao {
  /**
   * Find all active models
   * @returns {Promise<Array>} Array of active models
   */
  async findAllActive() {
    try {
      const models = await Model.findAll({
        where: { isActive: 1 },
        order: [['version', 'ASC']]
      });
      return models;
    } catch (error) {
      console.error('Error finding active models:', error);
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
      const model = await Model.findByPk(id);
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
        order: [['version', 'ASC']]
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
}

export default new ModelDao();

