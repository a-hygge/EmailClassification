import db from '../models/index.js';

const { Email, Label, sequelize } = db;

class DashboardController {

  async index(req, res) {
    try {
      const userId = req.session.user.id;

      // Lấy thống kê
      const totalEmails = await Email.count({
        where: { userId: userId }
      });

      const unreadEmails = await Email.count({
        where: {
          userId: userId,
          is_read: false
        }
      });

      // Lấy email gần đây
      const recentEmails = await Email.findAll({
        where: { userId: userId },
        include: [
          {
            model: Label,
            as: 'Label',
            attributes: ['name', 'display_name', 'color']
          }
        ],
        limit: 10,
        order: [['received_date', 'DESC']]
      });

      // Thống kê theo label
      const labelStats = await Email.findAll({
        where: { userId: userId },
        include: [
          {
            model: Label,
            as: 'Label',
            attributes: ['id', 'name', 'display_name', 'color']
          }
        ],
        attributes: [
          'labelId',
          [sequelize.fn('COUNT', sequelize.col('Email.id')), 'count']
        ],
        group: ['labelId', 'Label.id'],
        raw: false
      });

      res.render('pages/dashboard/index', {
        title: 'Dashboard - Email Classification System',
        layout: 'layouts/main',
        stats: {
          total: totalEmails,
          unread: unreadEmails,
          read: totalEmails - unreadEmails
        },
        recentEmails,
        labelStats
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