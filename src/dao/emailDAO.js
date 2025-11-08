/**
 * Email DAO (Data Access Object)
 * Handles all database operations related to Emails
 */
import db from '../models/index.js';

const { Email, EmailRecipient, Label, User } = db;

class EmailDao {
    /**
     * Find an email by ID
     * @param {number} id - Email ID
     * @returns {Promise<Object|null>} Email object or null
     */
    async findById(id) {
        try {
            const email = await Email.findByPk(id);
            return email;
        } catch (error) {
            console.error('Error finding email by ID:', error);
            throw error;
        }
    }

    /**
     * Find all emails
     * @param {Object} options - Query options (where, limit, offset, order, include)
     * @returns {Promise<Array>} Array of emails
     */
    async findAll(options = {}) {
        try {
            const emails = await Email.findAll(options);
            return emails;
        } catch (error) {
            console.error('Error finding all emails:', error);
            throw error;
        }
    }

    /**
     * Find emails with count (for pagination)
     * @param {Object} options - Query options (where, limit, offset, order, include)
     * @returns {Promise<Object>} Object with count and rows
     */
    async findAndCountAll(options = {}) {
        try {
            const result = await Email.findAndCountAll(options);
            return result;
        } catch (error) {
            console.error('Error finding and counting emails:', error);
            throw error;
        }
    }

    /**
     * Create a new email
     * @param {Object} emailData - Email data
     * @param {string} emailData.title - Email title
     * @param {string} emailData.content - Email content
     * @param {number} emailData.labelId - Label ID (optional)
     * @param {number} emailData.userId - User ID (optional)
     * @param {number} emailData.datasetId - Dataset ID (optional)
     * @returns {Promise<Object>} Created email object
     */
    async create(emailData) {
        try {
            const email = await Email.create(emailData);
            return email;
        } catch (error) {
            console.error('Error creating email:', error);
            throw error;
        }
    }

    /**
     * Update an email
     * @param {number} id - Email ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object|null>} Updated email object or null
     */
    async update(id, updateData) {
        try {
            const email = await Email.findByPk(id);
            if (!email) {
                return null;
            }
            await email.update(updateData);
            return email;
        } catch (error) {
            console.error('Error updating email:', error);
            throw error;
        }
    }

    /**
     * Update email's label
     * @param {number} id - Email ID
     * @param {number} labelId - Label ID
     * @returns {Promise<Object|null>} Updated email object or null
     * Lấy label theo ID
     */
    async updateLabel(id, labelId) {
        try {
            const email = await Email.findByPk(id);
            if (!email) {
                return null;
            }
            await email.update({ labelId });
            return email;
        } catch (error) {
            console.error('Error updating email label:', error);
            throw error;
        }
    }

    /**
     * Delete an email
     * @param {number} id - Email ID
     * @returns {Promise<boolean>} True if deleted, false if not found
     */
    async delete(id) {
        try {
            const email = await Email.findByPk(id);
            if (!email) {
                return false;
            }
            await email.destroy();
            return true;
        } catch (error) {
            console.error('Error deleting email:', error);
            throw error;
        }
    }

    /**
     * Count emails by criteria
     * @param {Object} where - Where clause
     * @returns {Promise<number>} Count of emails
     */
    async count(where = {}) {
        try {
            const count = await Email.count({ where });
            return count;
        } catch (error) {
            console.error('Error counting emails:', error);
            throw error;
        }
    }

    /**
     * Find one email by criteria
     * @param {Object} options - Query options (where, include)
     * @returns {Promise<Object|null>} Email object or null
     */
    async findOne(options = {}) {
        try {
            const email = await Email.findOne(options);
            return email;
        } catch (error) {
            console.error('Error finding one email:', error);
            throw error;
        }
    }


    // code cua Tuan Anh

    /**
     * Lấy danh sách email với phân trang
     */
    async findAllWithPagination(userId, limit, offset) {
        return await EmailRecipient.findAndCountAll({
            where: { userId },
            include: [{
                model: Email,
                as: 'email',
                include: [{
                        model: Label,
                        as: 'Label'
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username']
                    }
                ]
            }],
            limit,
            offset,
            order: [
                ['sendTime', 'DESC']
            ]
        });
    }

    /**
     * Lấy danh sách email theo label với phân trang
     */
    async findByLabelWithPagination(userId, labelId, limit, offset) {
        try {
            const result = await EmailRecipient.findAndCountAll({
                where: { userId },
                include: [{
                    model: Email,
                    as: 'email',
                    where: { labelId },
                    include: [{
                            model: Label,
                            as: 'Label'
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username']
                        }
                    ]
                }],
                limit,
                offset,
                order: [
                    ['sendTime', 'DESC']
                ]
            });

            return result;
        } catch (error) {
            console.error('DAO Error in findByLabelWithPagination:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách email quan trọng với phân trang
     */
    async findImportantWithPagination(userId, limit, offset) {
        return await EmailRecipient.findAndCountAll({
            where: {
                userId,
                isImportant: 1
            },
            include: [{
                model: Email,
                as: 'email',
                include: [{
                        model: Label,
                        as: 'Label'
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username']
                    }
                ]
            }],
            limit,
            offset,
            order: [
                ['sendTime', 'DESC']
            ]
        });
    }

    /**
     * Lấy tất cả labels
     */
    async findAllLabels() {
        return await Label.findAll();
    }

    /**
     * Lấy label theo ID
     */
    async findLabelById(labelId) {
        return await Label.findByPk(labelId);
    }

    /**
     * Tìm email recipient theo userId và emailId
     */
    async findEmailRecipient(userId, emailId) {
        return await EmailRecipient.findOne({
            where: {
                userId,
                emailId
            },
            include: [{
                model: Email,
                as: 'email',
                include: [{
                        model: Label,
                        as: 'Label'
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username']
                    }
                ]
            }]
        });
    }

    /**
     * Tìm email recipient đơn giản (không include)
     */
    async findSimpleEmailRecipient(userId, emailId) {
        return await EmailRecipient.findOne({
            where: { userId, emailId }
        });
    }

    /**
     * Cập nhật trạng thái đã đọc
     */
    async markAsRead(emailRecipient) {
        return await emailRecipient.update({ isRead: 1 });
    }

    /**
     * Toggle trạng thái quan trọng
     */
    async toggleImportant(emailRecipient, newValue) {
        return await emailRecipient.update({ isImportant: newValue });
    }

    /**
     * Xóa email recipient
     */
    async deleteEmailRecipient(emailId, transaction) {
        return await EmailRecipient.destroy({
            where: { emailId },
            transaction
        });
    }

    /**
     * Đếm số người nhận còn lại
     */
    async countRemainingRecipients(emailId, transaction) {
        return await EmailRecipient.count({
            where: { emailId },
            transaction
        });
    }

    /**
     * Xóa email gốc
     */
    async deleteEmail(emailId, transaction) {
        return await Email.destroy({
            where: { id: emailId },
            transaction
        });
    }

    /**
     * Tìm email recipient để xóa
     */
    async findEmailRecipientForDelete(emailId, userId) {
        return await EmailRecipient.findOne({
            where: { emailId, userId }
        });
    }

    // Code Thu Anh

    /**
     * Tạo email mới
     * @param {Object} emailData 
     * @param {Transaction} transaction 
     */
    async saveEmail(emailData, transaction) {
        return Email.create(emailData, { transaction });
    }

    /**
     * Tạo nhiều recipients cùng lúc
     * @param {Array} recipientList 
     * @param {Transaction} transaction 
     */
    async addRecipients(recipientList, transaction) {
        return EmailRecipient.bulkCreate(recipientList, { transaction });
    }


    //Email đã gửi
    async getSentEmailsWithRecipients(userId) {
        const emails = await Email.findAll({
            where: { userId },
            order: [
                ["createdAt", "DESC"]
            ],
            include: [{
                model: EmailRecipient,
                as: "recipients",
                include: [{
                    model: User,
                    as: "user",
                    attributes: ["id", "username"]
                }]
            }]
        });

        return emails.map(email => {
            const recipients = email.recipients.map(r => r.user ? r.user.username : "Không rõ");
            return {
                id: email.id,
                title: email.title,
                content: email.content,
                sentAt: email.sentAt,
                createdAt: email.createdAt,
                updatedAt: email.updatedAt,
                recipients
            };
        });
    }


    /**
     * Tìm user theo keyword
     * @param {string} keyword 
     */
    async searchUsersByKeyword(keyword) {
            return User.findAll({
                where: {
                    username: {
                        [db.Sequelize.Op.like]: `%${keyword}%`
                    }
                },
                attributes: ["id", "username"],
                limit: 10
            });
        }
        /*
            /**
             * Lấy danh sách user theo username chính xác (dùng khi gửi email)
             * @param {string[]} usernames
             */
        /*   async getSearchUser(usernames) {
        if (!Array.isArray(usernames) || usernames.length === 0) {
            return [];
        }

        return User.findAll({
            where: { username: usernames },
            attributes: ["id", "username"]
        });
    }
*/

}

export default new EmailDao();