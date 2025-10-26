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

  async create(name) {
    try {
      const label = await Label.create({ name });
      return label;
    } catch (error) {
      console.error("Error creating label:", error);
      throw error;
    }
  }

  async update(id, name) {
    try {
      const label = await Label.findByPk(id);
      if (!label) {
        return null;
      }
      await label.update({ name });
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
