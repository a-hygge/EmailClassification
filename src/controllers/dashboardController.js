import db from '../models/index.js';
import { Op } from 'sequelize';
import emailRecipientDAO from '../dao/emailRecipientDAO.js';

const { User, Email, EmailRecipient, Label, sequelize } = db;

class DashboardController {
  async index(req, res) {
    try {
      const userId = req.session.user.id;

      // Sử dụng DAO để lấy dữ liệu
      const totalEmails = await emailRecipientDAO.countTotalEmails(userId);
      const unreadEmails = await emailRecipientDAO.countUnreadEmails(userId);
      const importantEmails = await emailRecipientDAO.countImportantEmails(userId);

      // Lấy tất cả labels với số lượng email
      const labels = await emailRecipientDAO.getLabelsWithEmails(userId);

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

      // Lấy emails gần đây
      const recentEmails = await emailRecipientDAO.getRecentEmails(userId, 10);

      // Thống kê theo 7 ngày gần đây
      const { last7Days, emailsByDay } = await emailRecipientDAO.getEmailStatsByLast7Days(userId);

      const stats = {
        total: totalEmails,
        unread: unreadEmails,
        read: totalEmails - unreadEmails,
        important: importantEmails
      }

      req.session.stats = stats;
      req.session.labelsWithCount = labelsWithCount;
      // ===== RENDER VIEW =====
      res.render('pages/dashboard/dashboard', {
        title: 'Dashboard - Email Classification System',
        layout: 'layouts/main',
        currentPage: 'dashboard',
        stats: stats,
        labels: labelsWithCount,
        recentEmails,
        // labelStats: labelStatsMap,
        selectedLabel: null
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