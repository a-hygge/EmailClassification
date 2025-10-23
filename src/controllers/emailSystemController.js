import db from '../models/index.js';
import { Op } from 'sequelize';

const { Email, EmailRecipient, Label, User } = db;

class EmailSystemController {
  async getAllEmails(req, res) {
    try {
      const stats = req.session.stats || {};
      const labelsWithCount = req.session.labelsWithCount || [];
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const { count, rows: emailRecipients } = await EmailRecipient.findAndCountAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          },
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

      res.render('pages/emails/emailsSystem', {
        title: 'Email System - Email Classification System',
        layout: 'layouts/main',
        currentPage: 'emailsSystem',
        emails: emailRecipients,
        stats: stats,
        labels: labelsWithCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalEmails: count
        },
        selectedLabel: null
      })
    } catch (error) {
      console.error('Error fetching emails:', error)
      res.status(500).send('Internal Server Error')
    }
  }
}

const emailSystemController = new EmailSystemController();

export default emailSystemController;

export const { getAllEmails } = emailSystemController;