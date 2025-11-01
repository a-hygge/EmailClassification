import db from '../models/index.js';
import { Op } from 'sequelize';

const { User, Email, EmailRecipient, Label } = db;

class EmailRecipientDAO {
  /**
   * Đếm tổng số email của user
   */
  async countTotalEmails(userId) {
    return await EmailRecipient.count({
      where: { userId }
    });
  }

  /**
   * Đếm số email chưa đọc
   */
  async countUnreadEmails(userId) {
    return await EmailRecipient.count({
      where: {
        userId,
        isRead: 0
      }
    });
  }

  /**
   * Đếm số email quan trọng
   */
  async countImportantEmails(userId) {
    return await EmailRecipient.count({
      where: {
        userId,
        isImportant: 1
      }
    });
  }

  /**
   * Lấy tất cả labels với số lượng email
   */
  async getLabels(userId) {
    return await Label.findAll({
      include: [
        {
          model: Email,
          as: 'emails',
          include: [
            {
              model: EmailRecipient,
              as: 'recipients',
              where: { userId },
              required: false
            }
          ]
        }
      ]
    });
  }

  /**
   * Lấy emails gần đây (10 email mới nhất)
   */
  async getRecentEmails(userId, limit = 10) {
    return await EmailRecipient.findAll({
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
      order: [['sendTime', 'DESC']],
      limit
    });
  }
}

const emailRecipientDAO = new EmailRecipientDAO();

export default emailRecipientDAO;
