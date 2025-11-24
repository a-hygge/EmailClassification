import db from '../models/index.js';
import { Op } from 'sequelize';

const { User, Email, Label } = db;

class DashboardController {
    async index(req, res) {
        try {
            const userId = req.session.user.id;

            // Tổng số email mà user gửi
            const totalEmails = await Email.count({
                where: { sender_id: userId }
            });

            // Tổng email quan trọng (giả sử có cột is_important)
            const importantEmails = await Email.count({
                where: { sender_id: userId, is_important: 1 }
            });

            // Nếu muốn thống kê chưa đọc, cần thêm cột is_read cho Email
            // const unreadEmails = await Email.count({
            //   where: { receiver_id: userId, is_read: 0 }
            // });
            // Nếu chưa có cột is_read, có thể để 0
            const unreadEmails = 0;

            // Lấy tất cả labels
            const allLabels = await Label.findAll();
            const labels = allLabels.map(label => ({
                id: label.id,
                name: label.name
            }));

            // Lấy emails gần đây gửi đi
            const recentEmails = await Email.findAll({
                where: { sender_id: userId },
                include: [{
                        model: User,
                        as: 'Receiver',
                        attributes: ['id', 'username']
                    },
                    {
                        model: Label,
                        as: 'Label',
                        attributes: ['id', 'name']
                    }
                ],
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 10
            });

            const stats = {
                total: totalEmails,
                unread: unreadEmails,
                read: totalEmails - unreadEmails,
                important: importantEmails
            };

            req.session.stats = stats;
            req.session.labels = labels;

            res.render('pages/dashboard/dashboard', {
                title: 'Dashboard - Email Classification System',
                layout: 'layouts/main',
                currentPage: 'dashboard',
                stats,
                labels,
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