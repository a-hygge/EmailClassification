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
  async getLabelsWithEmails(userId) {
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

  /**
   * Đếm số email theo ngày
   */
  async countEmailsByDate(userId, startDate, endDate) {
    return await EmailRecipient.count({
      where: {
        userId,
        sendTime: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      }
    });
  }

  /**
   * Lấy thống kê email theo 7 ngày gần đây
   */
  async getEmailStatsByLast7Days(userId) {
    const last7Days = [];
    const emailsByDay = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await this.countEmailsByDate(userId, date, nextDate);

      // Format ngày
      const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
      last7Days.push(dayName);
      emailsByDay.push(count);
    }

    return { last7Days, emailsByDay };
  }
}

const emailRecipientDAO = new EmailRecipientDAO();

export default emailRecipientDAO;
