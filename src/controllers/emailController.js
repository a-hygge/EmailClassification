import db from "../models/index.js";
import emailDAO from "../dao/emailDAO.js";

class EmailController {

    // GET /emails - Danh sách email nhận
    async index(req, res) {
        const stats = req.session.stats || {};
        try {
            const userId = req.session.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = 20;
            const offset = (page - 1) * limit;

            // ✅ Lấy danh sách email mà user này là NGƯỜI NHẬN
            const { count, rows: emails } = await emailDAO.findReceivedEmailsWithPagination(
                userId,
                limit,
                offset
            );

            res.render('pages/emails/emails', {
                title: 'Hộp thư đến - Email Classification System',
                layout: 'layouts/main',
                currentPage: 'emails',
                emails,
                stats,
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

    // GET /emails/:id - Chi tiết email
    async show(req, res) {
        try {
            const userId = req.session.user.id;
            const emailId = parseInt(req.params.id);
            const stats = req.session.stats || {};

            const email = await emailDAO.findEmail(userId, emailId);
            if (!email) return res.status(404).send('Email not found');

            // Đánh dấu đã đọc
            if (!email.is_read) await emailDAO.markAsRead(email);

            res.render('pages/emails/emailDetail', {
                title: email.title,
                layout: 'layouts/main',
                currentPage: 'emails',
                email,
                stats,
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

            const email = await emailDAO.findSimpleEmail(userId, emailId);
            if (!email) return res.status(404).json({ success: false, message: 'Email not found' });

            await emailDAO.markAsRead(email);
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

            const email = await emailDAO.findSimpleEmail(userId, emailId);
            if (!email) return res.status(404).json({ success: false, message: 'Email not found' });

            const newValue = email.is_important ? 0 : 1;
            await emailDAO.toggleImportant(email, newValue);

            res.json({
                success: true,
                message: newValue ? 'Đã đánh dấu quan trọng' : 'Đã bỏ đánh dấu quan trọng',
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
            await emailDAO.deleteEmail(emailId, transaction);
            await transaction.commit();
            res.json({ success: true, message: 'Email đã được xóa thành công' });

        } catch (error) {
            await transaction.rollback();
            console.error('Delete email error:', error);
            res.status(500).json({ success: false, message: 'Server error khi xóa email' });
        }
    }

}

const emailController = new EmailController();

export const {
    index,
    show,
    markAsRead,
    toggleImportant,
    deleteEmail
} = emailController;

export default emailController;