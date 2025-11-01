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

      // Lấy tất cả labels
      const allLabels = await emailRecipientDAO.getLabels(userId);

      // Chỉ lấy id và name của labels
      const labels = allLabels.map(label => ({
        id: label.id,
        name: label.name
      }));

      // Lấy emails gần đây
      const recentEmails = await emailRecipientDAO.getRecentEmails(userId, 10);

      const stats = {
        total: totalEmails,
        unread: unreadEmails,
        read: totalEmails - unreadEmails,
        important: importantEmails
      }

      req.session.stats = stats;
      req.session.labels = labels;

      // ===== RENDER VIEW =====
      res.render('pages/dashboard/dashboard', {
        title: 'Dashboard - Email Classification System',
        layout: 'layouts/main',
        currentPage: 'dashboard',
        stats: stats,
        labels: labels,
        recentEmails,
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