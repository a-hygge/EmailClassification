/**
 * Dataset DAO (Data Access Object)
 * Handles all database operations related to Datasets
 * 
 * NOTE: Dataset chỉ được lưu vào DB khi user ấn "Save" sau khi retrain xong
 * Trước đó, dataset chỉ là object tạm thời chứa các sample được chọn
 */
import db from '../models/index.js';

const { Dataset, Email, DatasetEmail, Label } = db;

class DatasetDao {
  /**
   * Save dataset to database (called when user clicks Save after retraining)
   * Lưu dataset và liên kết với các email samples đã sử dụng
   * @param {Object} datasetData - Dataset information
   * @param {string} datasetData.name - Dataset name
   * @param {string} datasetData.path - Path to saved dataset file
   * @param {string} datasetData.description - Dataset description (optional)
   * @param {Array<number>} emailIds - Array of email IDs used in training
   * @returns {Promise<Object>} Created dataset with linked emails
   */
  async saveDataset(datasetData, emailIds) {
    const transaction = await db.sequelize.transaction();
    try {
      // Create dataset record
      const dataset = await Dataset.create({
        name: datasetData.name,
        path: datasetData.path,
        description: datasetData.description,
        quantity: emailIds ? emailIds.length : 0,
        createdAt: new Date()
      }, { transaction });

      // Link emails to dataset through tblDatasetEmail
      if (emailIds && emailIds.length > 0) {
        const datasetEmailLinks = emailIds.map(emailId => ({
          tblDatasetId: dataset.id,
          tblEmailId: emailId
        }));
        
        await DatasetEmail.bulkCreate(datasetEmailLinks, { transaction });
      }

      await transaction.commit();
      
      // Return dataset with linked emails
      return await this.findById(dataset.id);
    } catch (error) {
      await transaction.rollback();
      console.error('Error saving dataset:', error);
      throw error;
    }
  }

  /**
   * Find dataset by ID with all linked emails
   * @param {number} id - Dataset ID
   * @returns {Promise<Object|null>} Dataset with emails or null
   */
  async findById(id) {
    try {
      const dataset = await Dataset.findByPk(id, {
        include: [
          {
            model: Email,
            as: 'emails',
            through: { attributes: [] }, // Exclude junction table attributes
            include: [
              { model: Label, as: 'label' }
            ]
          }
        ]
      });
      return dataset;
    } catch (error) {
      console.error('Error finding dataset by ID:', error);
      throw error;
    }
  }

  /**
   * Find all datasets
   * @returns {Promise<Array>} Array of datasets
   */
  async findAll() {
    try {
      const datasets = await Dataset.findAll({
        include: [
          {
            model: Email,
            as: 'emails',
            through: { attributes: [] },
            include: [
              { model: Label, as: 'label' }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return datasets;
    } catch (error) {
      console.error('Error finding all datasets:', error);
      throw error;
    }
  }

  /**
   * Update dataset information
   * @param {number} id - Dataset ID
   * @param {Object} updateData - Data to update
   * @param {string} updateData.name - Dataset name (optional)
   * @param {string} updateData.path - Dataset path (optional)
   * @param {string} updateData.description - Dataset description (optional)
   * @param {number} updateData.quantity - Number of samples (optional)
   * @returns {Promise<Object|null>} Updated dataset or null
   */
  async update(id, updateData) {
    try {
      const dataset = await Dataset.findByPk(id);
      if (!dataset) return null;
      
      await dataset.update(updateData);
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating dataset:', error);
      throw error;
    }
  }

  /**
   * Delete a dataset
   * @param {number} id - Dataset ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    try {
      const dataset = await Dataset.findByPk(id);
      if (!dataset) return false;
      
      await dataset.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting dataset:', error);
      throw error;
    }
  }

  /**
   * Get emails from dataset
   * @param {number} datasetId - Dataset ID
   * @returns {Promise<Array>} Array of emails in dataset
   */
  async getDatasetEmails(datasetId) {
    try {
      const dataset = await Dataset.findByPk(datasetId, {
        include: [
          {
            model: Email,
            as: 'emails',
            through: { attributes: [] },
            include: [
              { model: Label, as: 'label' }
            ]
          }
        ]
      });
      
      return dataset ? dataset.emails : [];
    } catch (error) {
      console.error('Error getting dataset emails:', error);
      throw error;
    }
  }
}

export default new DatasetDao();
