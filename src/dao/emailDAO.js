import db from '../models/index.js';

const { Email, EmailRecipient, Label, User } = db;

class EmailDAO {
  /**
   * Lấy danh sách email với phân trang
   */
  async findAllWithPagination(userId, limit, offset) {
    return await EmailRecipient.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Email,
          as: 'email',
          include: [
            {
              model: Label,
              as: 'Label'
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['sendTime', 'DESC']]
    });
  }

  /**
   * Lấy danh sách email theo label với phân trang
   */
  async findByLabelWithPagination(userId, labelId, limit, offset) {
    try {
      const result = await EmailRecipient.findAndCountAll({
        where: { userId },
        include: [
          {
            model: Email,
            as: 'email',
            where: { labelId },
            include: [
              {
                model: Label,
                as: 'Label'
              },
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username']
              }
            ]
          }
        ],
        limit,
        offset,
        order: [['sendTime', 'DESC']]
      });

      return result;
    } catch (error) {
      console.error('DAO Error in findByLabelWithPagination:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách email quan trọng với phân trang
   */
  async findImportantWithPagination(userId, limit, offset) {
    return await EmailRecipient.findAndCountAll({
      where: {
        userId,
        isImportant: 1
      },
      include: [
        {
          model: Email,
          as: 'email',
          include: [
            {
              model: Label,
              as: 'Label'
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['sendTime', 'DESC']]
    });
  }

  /**
   * Lấy tất cả labels
   */
  async findAllLabels() {
    return await Label.findAll();
  }

  /**
   * Lấy label theo ID
   */
  async findLabelById(labelId) {
    return await Label.findByPk(labelId);
  }

  /**
   * Tìm email recipient theo userId và emailId
   */
  async findEmailRecipient(userId, emailId) {
    return await EmailRecipient.findOne({
      where: {
        userId,
        emailId
      },
      include: [
        {
          model: Email,
          as: 'email',
          include: [
            {
              model: Label,
              as: 'Label'
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });
  }

  /**
   * Tìm email recipient đơn giản (không include)
   */
  async findSimpleEmailRecipient(userId, emailId) {
    return await EmailRecipient.findOne({
      where: { userId, emailId }
    });
  }

  /**
   * Cập nhật trạng thái đã đọc
   */
  async markAsRead(emailRecipient) {
    return await emailRecipient.update({ isRead: 1 });
  }

  /**
   * Toggle trạng thái quan trọng
   */
  async toggleImportant(emailRecipient, newValue) {
    return await emailRecipient.update({ isImportant: newValue });
  }

  /**
   * Xóa email recipient
   */
  async deleteEmailRecipient(emailId, transaction) {
    return await EmailRecipient.destroy({
      where: { emailId },
      transaction
    });
  }

  /**
   * Đếm số người nhận còn lại
   */
  async countRemainingRecipients(emailId, transaction) {
    return await EmailRecipient.count({
      where: { emailId },
      transaction
    });
  }

  /**
   * Xóa email gốc
   */
  async deleteEmail(emailId, transaction) {
    return await Email.destroy({
      where: { id: emailId },
      transaction
    });
  }

  /**
   * Tìm email recipient để xóa
   */
  async findEmailRecipientForDelete(emailId, userId) {
    return await EmailRecipient.findOne({
      where: { emailId, userId }
    });
  }
}

const emailDAO = new EmailDAO();

export default emailDAO;
