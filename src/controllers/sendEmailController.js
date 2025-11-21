import db from "../models/index.js";

const { sequelize } = db;

import * as userDao from "../dao/userDao.js";
import emailDao from "../dao/emailDAO.js";
import emailRecipientDao from "../dao/emailRecipientDAO.js";

import nodemailer from "nodemailer";

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
        const email = await emailDao.saveEmail({ userId, title, content, sentAt: new Date() }, t);

        // Lấy danh sách user nhận hợp lệ
        const usernames = [...new Set(recipients.split(',').map(u => u.trim()).filter(u => u.length > 0))];
        const users = await userDao.getSearchUser(usernames);

        if (!users.length) throw new Error("Không tìm thấy người nhận hợp lệ.");

        const recipientList = users.map(u => ({
            emailId: email.id,
            userId: u.id,
            sendTime: new Date()
        }));

        await emailRecipientDao.saveRecipient(recipientList, t);

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

// Cấu hình Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// [GET] /email/gmail
export const showGmailForm = async(req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");

    res.render("pages/emails/sendGmail", {
        user: req.session.user,
        title: "Soạn Email Gmail",
        stats: await userDao.getUnreadStats(req.session.user.id)
    });
};


// [POST] /email/gmail
export const sendGmail = async(req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");

    try {
        const { recipients, title, content } = req.body;

        if (!recipients || !recipients.trim())
            throw new Error("Vui lòng nhập ít nhất 1 địa chỉ email.");

        //Gửi email trực tiếp đến Gmail
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: recipients,
            subject: title,
            text: content
        };

        await transporter.sendMail(mailOptions);

        res.render("pages/emails/sendGmail", {
            success: "✅ Gửi email thành công!",
            user: req.session.user,
            title: "Soạn Email",
            stats: await userDao.getUnreadStats(req.session.user.id),
        });

    } catch (error) {
        console.error(error);

        res.render("pages/emails/sendGmail", {
            error: "❌ Không thể gửi email! " + error.message,
            user: req.session.user,
            title: "Soạn Email",
            stats: { unread: 0 },
        });
    }
};


// [GET] /email/sent
export const sent = async(req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");

    try {
        const userId = req.session.user.id;

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