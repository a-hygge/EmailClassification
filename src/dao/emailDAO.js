import db from '../models/index.js';
import { Op } from 'sequelize';
const { Gmail } = db;

const { Email, User } = db;

class EmailDao {

    // --- Cơ bản ---
    async findById(id) {
        return Email.findByPk(id, {
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'username'] },
                { model: User, as: 'Receiver', attributes: ['id', 'username'] }
            ]
        });
    }

    async findAll(options = {}) {
        return Email.findAll(options);
    }

    async findAndCountAll(options = {}) {
        return Email.findAndCountAll(options);
    }

    async create(emailData) {
        return Email.create(emailData);
    }

    async update(id, updateData) {
        const email = await Email.findByPk(id);
        if (!email) return null;
        await email.update(updateData);
        return email;
    }

    async delete(id, transaction = null) {
        return Email.destroy({ where: { id }, transaction });
    }

    async count(where = {}) {
        return Email.count({ where });
    }

    async findOne(options = {}) {
        return Email.findOne(options);
    }

    // --- Pagination & Filter ---
    async findAllWithPagination(senderId, limit, offset) {
        return Email.findAndCountAll({
            where: { sender_id: senderId },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'username'] },
                { model: User, as: 'Receiver', attributes: ['id', 'username'] }
            ],
            limit,
            offset,
            order: [
                ['created_at', 'DESC']
            ]
        });
    }

    async findReceivedEmailsWithPagination(receiverId, limit, offset) {
        return Email.findAndCountAll({
            where: { receiver_id: receiverId },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'username'] },
                { model: User, as: 'Receiver', attributes: ['id', 'username'] }
            ],
            limit,
            offset,
            order: [
                ['created_at', 'DESC']
            ]
        });
    }


    // --- Chi tiết email ---
    async findEmailBySender(senderId, emailId) {
        return Email.findOne({
            where: { sender_id: senderId, id: emailId },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'username'] },
                { model: User, as: 'Receiver', attributes: ['id', 'username'] }
            ]
        });
    }

    async findSimpleEmailBySender(senderId, emailId) {
        return Email.findOne({ where: { sender_id: senderId, id: emailId } });
    }

    async markAsRead(email) {
        return email.update({ is_read: true });
    }

    async toggleImportant(email, newValue) {
        return email.update({ is_important: newValue });
    }

    async deleteEmail(emailId, transaction = null) {
        return Email.destroy({ where: { id: emailId }, transaction });
    }

    // --- Sent Emails ---
    async getSentEmails(senderId) {
        const emails = await Email.findAll({
            where: { sender_id: senderId },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'username'] },
                { model: User, as: 'Receiver', attributes: ['id', 'username'] }
            ],
            order: [
                ['created_at', 'DESC']
            ]
        });

        return emails.map(email => ({
            id: email.id,
            title: email.title,
            content: email.content,
            createdAt: email.created_at,
            updatedAt: email.updated_at,
            sentAt: email.sentAt,
            sender: email.Sender ? email.Sender.username : 'Không rõ',
            receiver: email.Receiver ? email.Receiver.username : 'Không rõ'
        }));
    }

    // --- User search ---
    async searchUsersByKeyword(keyword) {
        return User.findAll({
            where: {
                username: {
                    [Op.like]: `%${keyword}%`
                }
            },
            attributes: ['id', 'username'],
            limit: 10
        });
    }

    async getSearchUser(usernames) {
        if (!Array.isArray(usernames) || usernames.length === 0) return [];
        return User.findAll({
            where: { username: usernames },
            attributes: ['id', 'username']
        });
    }

    async saveEmail(emailData) {
        return Email.create(emailData);
    }
    async getSentEmailsWithRecipients(senderId) {
        const emails = await Email.findAll({
            where: { sender_id: senderId },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'username'] },
                { model: User, as: 'Receiver', attributes: ['id', 'username'] }
            ],
            order: [
                ['created_at', 'DESC']
            ]
        });

        return emails.map(email => ({
            id: email.id,
            title: email.title,
            content: email.content,
            createdAt: email.created_at,
            updatedAt: email.updated_at,
            sender: email.Sender ? email.Sender.username : 'Không rõ',
            receiver: email.Receiver ? email.Receiver.username : 'Không rõ'
        }));
    }

}

export const saveEmailReceivers = async(emails, title, content) => {
    for (const receiverEmail of emails) {
        await Gmail.create({
            receiver_email: receiverEmail,
            title,
            content
        });
    }
};

export default new EmailDao();