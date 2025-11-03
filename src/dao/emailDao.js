import db from '../models/index.js';

const { Email, Label } = db;

class EmailDao {
  /**
   * @param {number} id 
   * @returns {Promise<Object|null>} 
   */
  async findById(id) {
    try {
      const email = await Email.findByPk(id, {
        include: [
          { model: Label, as: 'label' }
        ]
      });
      return email;
    } catch (error) {
      console.error('Error finding email by ID:', error);
      throw error;
    }
  }

  /**
   * @param {Object} options 
   * @returns {Promise<Array>} 
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
   * @param {Object} options 
   * @returns {Promise<Object>} 
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
   * @param {Object} emailData 
   * @param {string} emailData.title 
   * @param {string} emailData.content 
   * @param {number} emailData.tblLabelId 
   * @returns {Promise<Object>} 
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
   * @param {number} id 
   * @param {Object} updateData 
   * @returns {Promise<Object|null>} 
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
   * @param {number} id 
   * @param {number} labelId 
   * @returns {Promise<Object|null>} 
   */
  async updateLabel(id, labelId) {
    try {
      const email = await Email.findByPk(id);
      if (!email) {
        return null;
      }
      await email.update({ tblLabelId: labelId });
      return email;
    } catch (error) {
      console.error('Error updating email label:', error);
      throw error;
    }
  }

  /**
   * @param {number} id 
   * @returns {Promise<boolean>} 
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
   * @param {Object} where 
   * @returns {Promise<number>} 
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
   * @param {Object} options 
   * @returns {Promise<Object|null>} 
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

  /**
   * @returns {Promise<Array>} 
   */
  async getSampleList() {
    try {
      const samples = await Email.findAll({
        where: {
          tblLabelId: { [db.sequelize.Sequelize.Op.ne]: null }
        },
        include: [
          { model: Label, as: 'label' }
        ],
        order: [['id', 'DESC']]
      });
      return samples;
    } catch (error) {
      console.error('Error getting sample list:', error);
      throw error;
    }
  }

  /**
   * @param {Array<number>} emailIds 
   * @returns {Promise<Array>} 
   */
  async findByIds(emailIds) {
    try {
      const emails = await Email.findAll({
        where: {
          id: emailIds
        },
        include: [
          { model: Label, as: 'label' }
        ]
      });
      return emails;
    } catch (error) {
      console.error('Error finding emails by IDs:', error);
      throw error;
    }
  }
}

export default new EmailDao();


