import db from '../models/index.js';
import { Op } from 'sequelize';
import emailDAO from '../dao/emailDAO.js';

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
      const { count, rows: emailRecipients } = await emailDAO.findAllWithPagination(userId, limit, offset);

      // Lấy tất cả labels
      const allLabels = await emailDAO.findAllLabels();

      // Chỉ lấy id và name của labels
      const labels = allLabels.map(label => ({
        id: label.id,
        name: label.name
      }));

      res.render('pages/emails/emails', {
        title: 'Hộp thư - Email Classification System',
        layout: 'layouts/main',
        currentPage: 'emails',
        emails: emailRecipients,
        labels: labels,
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

      const result = await emailDAO.findByLabelWithPagination(userId, labelId, limit, offset);
      const { count, rows: emailRecipients } = result;

      // Lấy tất cả labels
      const allLabels = await emailDAO.findAllLabels();

      // Chỉ lấy id và name của labels
      const labels = allLabels.map(label => ({
        id: label.id,
        name: label.name
      }));

      // Lấy thông tin label đang được chọn
      const selectedLabel = await emailDAO.findLabelById(labelId);

      res.render('pages/emails/emails', {
        title: `${selectedLabel.name} - Email Classification System`,
        layout: 'layouts/main',
        currentPage: 'emails',
        emails: emailRecipients,
        labels: labels,
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
      const labels = req.session.labels || [];

      const { count, rows: emailRecipients } = await emailDAO.findImportantWithPagination(userId, limit, offset);
      res.render('pages/emails/emails', {
        title: 'Email Quan Trọng - Email Classification System',
        layout: 'layouts/main',
        currentPage: 'ImportantEmails',
        emails: emailRecipients,
        stats: stats,
        selectedLabel: null,
        labels: labels,
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
      const labels = req.session.labels || [];

      const emailRecipient = await emailDAO.findEmailRecipient(userId, emailId);

      if (!emailRecipient) {
        return res.status(404).send('Email not found');
      }

      const selectedLabelId = req.params.labelId ? parseInt(req.params.labelId) : null;
      const selectedLabel = selectedLabelId
        ? await emailDAO.findLabelById(selectedLabelId)
        : null;

      // Đánh dấu đã đọc
      if (emailRecipient.isRead === 0) {
        await emailDAO.markAsRead(emailRecipient);
      }

      res.render('pages/emails/emailDetail', {
        title: emailRecipient.email.title,
        layout: 'layouts/main',
        currentPage: 'emails',
        emailRecipient,
        labels: labels,
        stats: stats,
        selectedLabel: selectedLabel
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

      const emailRecipient = await emailDAO.findSimpleEmailRecipient(userId, emailId);

      if (!emailRecipient) {
        return res.status(404).json({ success: false, message: 'Email not found' });
      }

      await emailDAO.markAsRead(emailRecipient);

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

      const emailRecipient = await emailDAO.findSimpleEmailRecipient(userId, emailId);

      if (!emailRecipient) {
        return res.status(404).json({ success: false, message: 'Email not found' });
      }

      const newValue = emailRecipient.isImportant === 1 ? 0 : 1;
      await emailDAO.toggleImportant(emailRecipient, newValue);

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
      const emailRecipient = await emailDAO.findEmailRecipientForDelete(emailId, userId);

      if (!emailRecipient) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Email not found' });
      }

      // Xóa trong EmailRecipient trước
      await emailDAO.deleteEmailRecipient(emailId, transaction);

      // Đếm số người nhận còn lại
      const remainingRecipients = await emailDAO.countRemainingRecipients(emailId, transaction);


      // Xóa email gốc (nếu không còn người nhận nào khác)
      if (remainingRecipients === 0) {
        await emailDAO.deleteEmail(emailId, transaction);
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