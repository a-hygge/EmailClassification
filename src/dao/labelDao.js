/**
 * Label DAO (Data Access Object)
 * Handles all database operations related to Labels
 */
import db from "../models/index.js";

const { Label } = db;

class LabelDao {
  async findByName(name) {
    try {
      const label = await Label.findOne({
        where: { name },
      });
      return label;
    } catch (error) {
      console.error("Error finding label by name:", error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const label = await Label.findByPk(id);
      return label;
    } catch (error) {
      console.error("Error finding label by ID:", error);
      throw error;
    }
  }

  async findAll() {
    try {
      const labels = await Label.findAll({
        order: [["name", "ASC"]],
      });
      return labels;
    } catch (error) {
      console.error("Error finding all labels:", error);
      throw error;
    }
  }

  /**
   * Create a new label
   * @param {Object} labelData - Label data
   * @param {string} labelData.name - Label name
   * @param {string} labelData.description - Label description (optional)
   * @returns {Promise<Object>} Created label
   */
  async create(labelData) {
    try {
      const label = await Label.create(labelData);
      return label;
    } catch (error) {
      console.error("Error creating label:", error);
      throw error;
    }
  }

  /**
   * Update a label
   * @param {number} id - Label ID
   * @param {Object} updateData - Data to update
   * @param {string} updateData.name - Label name
   * @param {string} updateData.description - Label description (optional)
   * @returns {Promise<Object|null>} Updated label or null
   */
  async update(id, updateData) {
    try {
      const label = await Label.findByPk(id);
      if (!label) {
        return null;
      }
      await label.update(updateData);
      return label;
    } catch (error) {
      console.error("Error updating label:", error);
      throw error;
    }
  }

  /**
   * Delete a label
   * @param {number} id - Label ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    try {
      const label = await Label.findByPk(id);
      if (!label) {
        return false;
      }
      await label.destroy();
      return true;
    } catch (error) {
      console.error("Error deleting label:", error);
      throw error;
    }
  }
}

export default new LabelDao();
