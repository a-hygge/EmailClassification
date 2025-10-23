import db from '../models/index.js';
import { Op } from 'sequelize';

const { Email, EmailRecipient, Label, User } = db;

class EmailController {

  // GET /emails - Danh sách tất cả email
  async index(req, res) {
    try {
      const userId = req.session.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      // Lấy danh sách email của user
      const { count, rows: emailRecipients } = await EmailRecipient.findAndCountAll({
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
        limit,
        offset,
        order: [['sendTime', 'DESC']]
      });

      // Lấy tất cả labels
      const allLabels = await Label.findAll();

      // Đếm số email cho mỗi label
      const labelsWithCount = await Promise.all(
        allLabels.map(async (label) => {
          const emailCount = await EmailRecipient.count({
            where: { userId },
            include: [
              {
                model: Email,
                as: 'email',
                where: { labelId: label.id }
              }
            ]
          });

          return {
            id: label.id,
            name: label.name,
            emailCount
          };
        })
      );

      res.render('pages/emails/index', {
        title: 'Hộp thư - Email Classification System',
        layout: 'layouts/main',
        currentPage: 'emails',
        emails: emailRecipients,
        labels: labelsWithCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalEmails: count
        },
        selectedLabel: null
      });

    } catch (error) {
      console.error('Email index error:', error);
      res.status(500).send('Server Error');
    }
  }

  // GET /emails/label/:labelId - Lọc email theo label
  async getByLabel(req, res) {
    try {
      const userId = req.session.user.id;
      const labelId = parseInt(req.params.labelId);
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      // Lấy email theo label
      const { count, rows: emailRecipients } = await EmailRecipient.findAndCountAll({
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
              }
            ]
          }
        ],
        limit,
        offset,
        order: [['sendTime', 'DESC']]
      });

      // Lấy tất cả labels
      const allLabels = await Label.findAll();

      const labelsWithCount = await Promise.all(
        allLabels.map(async (label) => {
          const emailCount = await EmailRecipient.count({
            where: { userId },
            include: [
              {
                model: Email,
                as: 'email',
                where: { labelId: label.id }
              }
            ]
          });

          return {
            id: label.id,
            name: label.name,
            emailCount
          };
        })
      );

      // Lấy thông tin label đang được chọn
      const selectedLabel = await Label.findByPk(labelId);

      res.render('pages/emails/index', {
        title: `${selectedLabel.name} - Email Classification System`,
        layout: 'layouts/main',
        currentPage: 'emails',
        emails: emailRecipients,
        labels: labelsWithCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalEmails: count
        },
        selectedLabel
      });

    } catch (error) {
      console.error('Email by label error:', error);
      res.status(500).send('Server Error');
    }
  }

  // GET /emails/:id - Chi tiết email
  async show(req, res) {
    try {
      const userId = req.session.user.id;
      const emailId = parseInt(req.params.id);

      const emailRecipient = await EmailRecipient.findOne({
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

      if (!emailRecipient) {
        return res.status(404).send('Email not found');
      }

      // Đánh dấu đã đọc
      if (emailRecipient.isRead === 0) {
        await emailRecipient.update({ isRead: 1 });
      }

      res.render('pages/emails/detail', {
        title: emailRecipient.email.title,
        layout: 'layouts/main',
        currentPage: 'emails',
        emailRecipient
      });

    } catch (error) {
      console.error('Email show error:', error);
      res.status(500).send('Server Error');
    }
  }

  // PUT /emails/:id/read - Đánh dấu đã đọc
  async markAsRead(req, res) {
    try {
      const userId = req.session.user.id;
      const emailId = parseInt(req.params.id);

      const emailRecipient = await EmailRecipient.findOne({
        where: { userId, emailId }
      });

      if (!emailRecipient) {
        return res.status(404).json({ success: false, message: 'Email not found' });
      }

      await emailRecipient.update({ isRead: 1 });

      res.json({ success: true, message: 'Đã đánh dấu đã đọc' });

    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // PUT /emails/:id/important - Toggle quan trọng
  async toggleImportant(req, res) {
    try {
      const userId = req.session.user.id;
      const emailId = parseInt(req.params.id);

      const emailRecipient = await EmailRecipient.findOne({
        where: { userId, emailId }
      });

      if (!emailRecipient) {
        return res.status(404).json({ success: false, message: 'Email not found' });
      }

      const newValue = emailRecipient.isImportant === 1 ? 0 : 1;
      await emailRecipient.update({ isImportant: newValue });

      res.json({
        success: true,
        message: newValue === 1 ? 'Đã đánh dấu quan trọng' : 'Đã bỏ đánh dấu quan trọng',
        isImportant: newValue
      });

    } catch (error) {
      console.error('Toggle important error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

const emailController = new EmailController();

export const {
  index,
  getByLabel,
  show,
  markAsRead,
  toggleImportant
} = emailController;

export default emailController;