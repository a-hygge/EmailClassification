/*import db from "../models/index.js";
import { Op } from "sequelize";
const { User, Email, EmailRecipient, sequelize } = db;

// [GET] /email/send
export const showSendEmailPage = (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const user = req.session.user;

    res.render("pages/emails/sendEmail", {
        user,
        title: "Soạn Email",
        stats: { unread: 0 }
    });
};

// [GET] /email/search?keyword=
export const searchUser = async(req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Chưa đăng nhập" });

    try {
        const keyword = req.query.keyword || "";
        if (!keyword.trim()) return res.json([]);

        const users = await User.findAll({
            where: {
                username: {
                    [Op.like]: `%${keyword}%`
                }
            },
            attributes: ["username"],
            limit: 10
        });

        res.json(users.map(u => u.username));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// [POST] /email/send
export const sendEmail = async(req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const t = await sequelize.transaction();

    try {
        const { recipients, title, content } = req.body;
        const userId = req.session.user.id; // cột userId trong Email

        if (!recipients || !recipients.trim()) throw new Error("Vui lòng nhập ít nhất 1 người nhận.");

        // Tạo email trong transaction
        const email = await Email.create({
            userId, // id người gửi
            title,
            content,
            sentAt: new Date()
        }, { transaction: t });

        // Lấy danh sách user nhận
        const usernames = [...new Set(recipients.split(',').map(u => u.trim()).filter(u => u.length > 0))];
        const users = await User.findAll({
            where: {
                username: {
                    [Op.in]: usernames
                }
            },
            attributes: ["id", "username"]
        });

        if (!users.length) throw new Error("Không tìm thấy người nhận hợp lệ.");

        // Tạo EmailRecipient trong transaction
        const recipientList = users.map(u => ({
            emailId: email.id, // id email mới tạo
            userId: u.id,
            sendTime: new Date()
        }));

        await EmailRecipient.bulkCreate(recipientList, { transaction: t });

        // Commit transaction
        await t.commit();

        res.render("pages/emails/sendEmail", {
            success: "Gửi email thành công!",
            user: req.session.user,
            title: "Soạn Email",
            stats: { unread: 0 }
        });

    } catch (error) {
        await t.rollback(); // rollback nếu lỗi

        res.render("pages/emails/sendEmail", {
            error: "Không thể gửi email! " + error.message,
            user: req.session.user,
            title: "Soạn Email",
            stats: { unread: 0 }
        });
    }
};


// [GET] /email/sent
export const sent = async(req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");

    const userId = req.session.user.id;

    try {

        const sentEmails = await Email.findAll({
            where: { userId },
            order: [
                ["createdAt", "DESC"]
            ],
            raw: true
        });

        const emailIds = sentEmails.map(e => e.id);


        const recipients = await EmailRecipient.findAll({
            where: { emailId: emailIds },
            raw: true
        });


        const userIds = [...new Set(recipients.map(r => r.userId))];
        const users = await User.findAll({
            where: { id: userIds },
            attributes: ["id", "username"],
            raw: true
        });


        const userMap = {};
        users.forEach(u => { userMap[u.id] = u.username; });


        const recipientsMap = {};
        recipients.forEach(r => {
            if (!recipientsMap[r.emailId]) recipientsMap[r.emailId] = [];
            recipientsMap[r.emailId].push(userMap[r.userId] || "Không rõ");
        });


        const emailsWithRecipients = sentEmails.map(email => ({
            ...email,
            recipients: recipientsMap[email.id] || []
        }));


        res.render("pages/emails/sent", {
            emails: emailsWithRecipients,
            user: req.session.user,
            title: "Email đã gửi",
            currentPage: "sent",
            stats: { totalSent: emailsWithRecipients.length }
        });

    } catch (error) {
        console.error("Lỗi khi tải danh sách email đã gửi:", error);
        res.render("pages/emails/sent", {
            error: "Không thể tải danh sách email đã gửi: " + error.message,
            emails: [],
            user: req.session.user,
            title: "Email đã gửi",
            currentPage: "sent"
        });
    }
};*/
// import toàn bộ db
import db from "../models/index.js";

// lấy sequelize từ db
const { sequelize } = db;

// import dao (giữ nguyên nếu dao export từng hàm)
import * as userDao from "../dao/userDao.js";
import * as emailDao from "../dao/emailDAO.js"; // chú ý tên file: emailDao.js


// [GET] /email/send
export const showSendEmailPage = async(req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    try {
        const userId = req.session.user.id;

        // Lấy user từ DB qua DAO
        const user = await userDao.getUserById(userId);

        // Lấy stats email chưa đọc
        const stats = await userDao.getUnreadStats(userId);

        res.render("pages/emails/sendEmail", {
            user,
            title: "Soạn Email",
            stats
        });
    } catch (error) {
        console.error("Lỗi khi tải trang soạn email:", error);
        res.render("pages/emails/sendEmail", {
            user: req.session.user,
            title: "Soạn Email",
            stats: { unread: 0 },
            error: "Không thể tải thông tin người dùng."
        });
    }
};

// [GET] /email/search?keyword=
export const searchUser = async(req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Chưa đăng nhập" });

    try {
        const keyword = (req.query.keyword || "").trim();
        if (!keyword) return res.json([]);

        const users = await userDao.searchUsersByKeyword(keyword);
        res.json(users.map(u => u.username));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// [POST] /email/send
export const sendEmail = async(req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const t = await sequelize.transaction();

    try {
        const { recipients, title, content } = req.body;
        const userId = req.session.user.id;

        if (!recipients || !recipients.trim()) throw new Error("Vui lòng nhập ít nhất 1 người nhận.");

        // Tạo email
        const email = await emailDao.createEmail({ userId, title, content, sentAt: new Date() }, t);

        // Lấy danh sách user nhận hợp lệ
        const usernames = [...new Set(recipients.split(',').map(u => u.trim()).filter(u => u.length > 0))];
        const users = await emailDao.getUsersByUsernames(usernames);

        if (!users.length) throw new Error("Không tìm thấy người nhận hợp lệ.");

        const recipientList = users.map(u => ({
            emailId: email.id,
            userId: u.id,
            sendTime: new Date()
        }));

        await emailDao.addRecipients(recipientList, t);

        await t.commit();

        res.render("pages/emails/sendEmail", {
            success: "Gửi email thành công!",
            user: req.session.user,
            title: "Soạn Email",
            stats: await userDao.getUnreadStats(userId)
        });

    } catch (error) {
        await t.rollback();

        res.render("pages/emails/sendEmail", {
            error: "Không thể gửi email! " + error.message,
            user: req.session.user,
            title: "Soạn Email",
            stats: { unread: 0 }
        });
    }
};


// [GET] /email/sent
export const sent = async(req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");

    try {
        const userId = req.session.user.id;

        // Lấy emails + recipients đã join sẵn
        const emailsWithRecipients = await emailDao.getSentEmailsWithRecipients(userId);

        res.render("pages/emails/sent", {
            emails: emailsWithRecipients,
            user: req.session.user,
            title: "Email đã gửi",
            currentPage: "sent",
            stats: { totalSent: emailsWithRecipients.length }
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách email đã gửi:", error);
        res.render("pages/emails/sent", {
            error: "Không thể tải danh sách email đã gửi: " + error.message,
            emails: [],
            user: req.session.user,
            title: "Email đã gửi",
            currentPage: "sent"
        });
    }
};