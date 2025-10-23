import db from '../models/index.js';
import { Op } from 'sequelize';

const { User, Email, EmailRecipient, Label, sequelize } = db;

class DashboardController {
  async index(req, res) {
    try {
      const userId = req.session.user.id;
      // Tổng số email người dùng nhận được
      const totalEmails = await EmailRecipient.count({
        where: { userId }
      });

      // Số email chưa đọc
      const unreadEmails = await EmailRecipient.count({
        where: {
          userId,
          isRead: 0
        }
      });

      // Số email quan trọng
      const importantEmails = await EmailRecipient.count({
        where: {
          userId,
          isImportant: 1
        }
      });

      // ===== LẤY TẤT CẢ LABELS VỚI SỐ LƯỢNG EMAIL =====
      const labels = await Label.findAll({
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

      // Đếm số email cho mỗi label
      const labelsWithCount = labels.map(label => {
        const emailCount = label.emails.reduce((count, email) => {
          return count + email.recipients.length;
        }, 0);

        return {
          id: label.id,
          name: label.name,
          emailCount
        };
      });

      // ===== LẤY EMAILS GẦN ĐÂY =====
      const recentEmails = await EmailRecipient.findAll({
        where: { userId },
        include: [
          {
            model: Email,
            as: 'email',
            include: [
              {
                model: Label,
                as: 'Label'
              }
            ]
          }
        ],
        order: [['sendTime', 'DESC']],
        limit: 10
      });

      // ===== THỐNG KÊ THEO LABEL =====
      const labelStatsMap = {};

      for (const label of labels) {
        let count = 0;
        for (const email of label.emails) {
          count += email.recipients.length;
        }
        labelStatsMap[label.name] = count;
      }

      // ===== THỐNG KÊ THEO NGÀY (7 ngày gần đây) =====
      const last7Days = [];
      const emailsByDay = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = await EmailRecipient.count({
          where: {
            userId,
            sendTime: {
              [Op.gte]: date,
              [Op.lt]: nextDate
            }
          }
        });

        // Format ngày
        const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
        last7Days.push(dayName);
        emailsByDay.push(count);
      }

      // ===== RENDER VIEW =====
      res.render('pages/dashboard/index', {
        title: 'Dashboard - Email Classification System',
        layout: 'layouts/main',
        currentPage: 'dashboard',
        stats: {
          total: totalEmails,
          unread: unreadEmails,
          read: totalEmails - unreadEmails,
          important: importantEmails
        },
        labels: labelsWithCount,
        recentEmails,
        labelStats: labelStatsMap,
        chartData: {
          days: last7Days,
          counts: emailsByDay
        }
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).render('pages/error', {
        title: 'Error',
        message: 'Có lỗi xảy ra khi tải dashboard',
        layout: 'layouts/main'
      });
    }
  }
}

const dashboardController = new DashboardController();

export const { index } = dashboardController;

export default dashboardController;