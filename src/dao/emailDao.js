/**
 * Email DAO (Data Access Object)
 * Handles all database operations related to Emails
 */
import db from '../models/index.js';

const { Email } = db;

class EmailDao {
  /**
   * Find an email by ID
   * @param {number} id - Email ID
   * @returns {Promise<Object|null>} Email object or null
   */
  async findById(id) {
    try {
      const email = await Email.findByPk(id);
      return email;
    } catch (error) {
      console.error('Error finding email by ID:', error);
      throw error;
    }
  }

  /**
   * Find all emails
   * @param {Object} options - Query options (where, limit, offset, order, include)
   * @returns {Promise<Array>} Array of emails
   */
  async findAll(options = {}) {
    try {
      const emails = await Email.findAll(options);
      return emails;
    } catch (error) {
      console.error('Error finding all emails:', error);
      throw error;
    }
  }

  /**
   * Find emails with count (for pagination)
   * @param {Object} options - Query options (where, limit, offset, order, include)
   * @returns {Promise<Object>} Object with count and rows
   */
  async findAndCountAll(options = {}) {
    try {
      const result = await Email.findAndCountAll(options);
      return result;
    } catch (error) {
      console.error('Error finding and counting emails:', error);
      throw error;
    }
  }

  /**
   * Create a new email
   * @param {Object} emailData - Email data
   * @param {string} emailData.title - Email title
   * @param {string} emailData.content - Email content
   * @param {number} emailData.labelId - Label ID (optional)
   * @param {number} emailData.userId - User ID (optional)
   * @param {number} emailData.datasetId - Dataset ID (optional)
   * @returns {Promise<Object>} Created email object
   */
  async create(emailData) {
    try {
      const email = await Email.create(emailData);
      return email;
    } catch (error) {
      console.error('Error creating email:', error);
      throw error;
    }
  }

  /**
   * Update an email
   * @param {number} id - Email ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated email object or null
   */
  async update(id, updateData) {
    try {
      const email = await Email.findByPk(id);
      if (!email) {
        return null;
      }
      await email.update(updateData);
      return email;
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }

  /**
   * Update email's label
   * @param {number} id - Email ID
   * @param {number} labelId - Label ID
   * @returns {Promise<Object|null>} Updated email object or null
   */
  async updateLabel(id, labelId) {
    try {
      const email = await Email.findByPk(id);
      if (!email) {
        return null;
      }
      await email.update({ labelId });
      return email;
    } catch (error) {
      console.error('Error updating email label:', error);
      throw error;
    }
  }

  /**
   * Delete an email
   * @param {number} id - Email ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    try {
      const email = await Email.findByPk(id);
      if (!email) {
        return false;
      }
      await email.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  }

  /**
   * Count emails by criteria
   * @param {Object} where - Where clause
   * @returns {Promise<number>} Count of emails
   */
  async count(where = {}) {
    try {
      const count = await Email.count({ where });
      return count;
    } catch (error) {
      console.error('Error counting emails:', error);
      throw error;
    }
  }

  /**
   * Find one email by criteria
   * @param {Object} options - Query options (where, include)
   * @returns {Promise<Object|null>} Email object or null
   */
  async findOne(options = {}) {
    try {
      const email = await Email.findOne(options);
      return email;
    } catch (error) {
      console.error('Error finding one email:', error);
      throw error;
    }
  }
}

export default new EmailDao();

