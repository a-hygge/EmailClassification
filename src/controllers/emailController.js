import db from '../models/index.js';
import { Op } from 'sequelize';

const { Email, Label, User } = db;

class EmailController {
  async index(req, res) {
    const stats = req.session.stats || {};
    try {
      const userId = req.session.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      // Lấy email của user hiện tại (dựa vào sender hoặc receiver)
      const userEmail = req.session.user.email; // Giả sử user có email

      const { count, rows: emails } = await Email.findAndCountAll({
        where: {
          [Op.or]: [
            { sender: userEmail },
            { receiver: userEmail }
          ]
        },
        include: [
          {
            model: Label,
            as: 'label',
            required: false
          }
        ],
        limit,
        offset,
        order: [['id', 'DESC']]
      });

      // Lấy tất cả labels
      const allLabels = await Label.findAll();

      // Đếm số email cho mỗi label (của user hiện tại)
      const labelsWithCount = await Promise.all(
        allLabels.map(async (label) => {
          const emailCount = await Email.count({
            where: {
              tblLabelId: label.id,
              [Op.or]: [
                { sender: userEmail },
                { receiver: userEmail }
              ]
            }
          });

          return {
            id: label.id,
            name: label.name,
            count: emailCount
          };
        })
      );

      res.render('pages/emails/emails', {
        title: 'Hộp thư - Email Classification System',
        layout: 'layouts/main',
        currentPage: 'emails',
        emails: emails,
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
      const userEmail = req.session.user.email;
      const labelId = parseInt(req.params.labelId);
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;
      const stats = req.session.stats || {};

      // Lấy email theo label
      const { count, rows: emails } = await Email.findAndCountAll({
        where: {
          tblLabelId: labelId,
          [Op.or]: [
            { sender: userEmail },
            { receiver: userEmail }
          ]
        },
        include: [
          {
            model: Label,
            as: 'label',
            required: false
          }
        ],
        limit,
        offset,
        order: [['id', 'DESC']]
      });

      // Lấy tất cả labels
      const allLabels = await Label.findAll();

      const labelsWithCount = await Promise.all(
        allLabels.map(async (label) => {
          const emailCount = await Email.count({
            where: {
              tblLabelId: label.id,
              [Op.or]: [
                { sender: userEmail },
                { receiver: userEmail }
              ]
            }
          });

          return {
            id: label.id,
            name: label.name,
            count: emailCount
          };
        })
      );

      // Lấy thông tin label đang được chọn
      const selectedLabel = await Label.findByPk(labelId);

      res.render('pages/emails/emails', {
        title: `${selectedLabel.name} - Email Classification System`,
        layout: 'layouts/main',
        currentPage: 'emails',
        emails: emails,
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
  // Note: Tính năng này cần bảng EmailUser với trường isImportant
  // Tạm thời redirect về trang chính
  async getImportantEmails(req, res) {
    try {
      return res.redirect('/emails');
    } catch (error) {
      console.error('Important emails error:', error);
      res.status(500).send('Server Error');
    }
  }


  // GET /emails/:id - Chi tiết email
  async show(req, res) {
    try {
      const userEmail = req.session.user.email;
      const emailId = parseInt(req.params.id);
      const stats = req.session.stats || {};
      const labelsWithCount = req.session.labelsWithCount || [];

      const email = await Email.findOne({
        where: {
          id: emailId,
          [Op.or]: [
            { sender: userEmail },
            { receiver: userEmail }
          ]
        },
        include: [
          {
            model: Label,
            as: 'label',
            required: false
          }
        ]
      });

      if (!email) {
        return res.status(404).send('Email not found');
      }

      res.render('pages/emails/emailDetail', {
        title: email.title || 'Email Detail',
        layout: 'layouts/main',
        currentPage: 'emails',
        email: email,
        labels: labelsWithCount,
        stats: stats,
        selectedLabel: null
      });

    } catch (error) {
      console.error('Email show error:', error);
      res.status(500).send('Server Error');
    }
  }

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