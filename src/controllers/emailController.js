import db from '../models/index.js';
import { Op } from 'sequelize';

const { Email, EmailRecipient, Label, User } = db;

class EmailController {

  // GET /emails - Danh sách tất cả email
  async index(req, res) {
    const stats = req.session.stats || {};
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

      res.render('pages/emails/emails', {
        title: 'Hộp thư - Email Classification System',
        layout: 'layouts/main',
        currentPage: 'emails',
        emails: emailRecipients,
        labels: labelsWithCount,
        stats: stats,
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
      const stats = req.session.stats || {};

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

      res.render('pages/emails/emails', {
        title: `${selectedLabel.name} - Email Classification System`,
        layout: 'layouts/main',
        currentPage: 'emails',
        emails: emailRecipients,
        labels: labelsWithCount,
        stats: stats,
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

  // GET/emails/important - Danh sách email quan trọng
  async getImportantEmails(req, res) {
    try {
      const userId = req.session.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;
      const stats = req.session.stats || {};
      const labelsWithCount = req.session.labelsWithCount || [];

      const { count, rows: emailRecipients } = await EmailRecipient.findAndCountAll({
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
      res.render('pages/emails/emails', {
        title: 'Email Quan Trọng - Email Classification System',
        layout: 'layouts/main',
        currentPage: 'ImportantEmails',
        emails: emailRecipients,
        stats: stats,
        selectedLabel: null,
        labels: labelsWithCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalEmails: count
        }
      });
    } catch (error) {
      console.error('Important emails error:', error);
      res.status(500).send('Server Error');
    }
  }


  // GET /emails/:id - Chi tiết email
  async show(req, res) {
    try {
      const userId = req.session.user.id;
      const emailId = parseInt(req.params.id);
      const stats = req.session.stats || {};

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

      res.render('pages/emails/emailDetail', {
        title: emailRecipient.email.title,
        layout: 'layouts/main',
        currentPage: 'emails',
        emailRecipient,
        stats: stats,
        selectedLabel: null
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

  // DELETE /emails/:emailId - Xoá email
  async deleteEmail(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const emailId = parseInt(req.params.emailId);
      const userId = req.session.user.id;

      // Xoá bản ghi trong EmailRecipient
      const emailRecipient = await EmailRecipient.findOne({
        where: { emailId, userId }
      });

      if (!emailRecipient) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Email not found' });
      }

      // Xóa trong EmailRecipient trước
      await EmailRecipient.destroy({
        where: { emailId },
        transaction: transaction
      });

      // Sau đó xóa email gốc (nếu không còn người nhận nào khác)
      const remainingRecipients = await EmailRecipient.count({
        where: { emailId },
        transaction: transaction
      });

      if (remainingRecipients === 0) {
        await Email.destroy({
          where: { id: emailId },
          transaction: transaction
        });
      }

      await transaction.commit();
      res.json({ success: true, message: 'Email đã được xóa thành công' });
    }
    catch (error) {
      await transaction.rollback();
      console.error('Delete email error:', error);
      res.status(500).json({ success: false, message: 'Server error khi xóa email' });
    }
  }
}

const emailController = new EmailController();

export const {
  index,
  getByLabel,
  show,
  markAsRead,
  toggleImportant,
  deleteEmail,
  getImportantEmails
} = emailController;

export default emailController;