import db from "../models/index.js";
const { sequelize } = db;

import * as userDao from "../dao/userDao.js";
import emailDao from "../dao/emailDAO.js";
import GmailModel from "../models/Gmail.js";

import nodemailer from "nodemailer";
import Email from "../services/EmailService.js";

import { saveEmailReceivers } from "../dao/emailDAO.js";

//[GET] /email/send
export const showSendEmailPage = async(req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");

    try {
        const userId = req.session.user.id;
        const user = await userDao.getUserById(userId);
        const stats = await userDao.getUnreadStats(userId);

        res.render("pages/emails/sendEmail", { user, title: "Soạn Email", stats });
    } catch (error) {
        console.error("Lỗi khi tải trang soạn email:", error);
        res.render("pages/emails/sendEmail", {
            user: req.session.user,
            title: "Soạn Email",
            stats: { unread: 0 },
            error: "Không thể tải thông tin người dùng.",
        });
    }
};

//[GET] /email/search?keyword=
export const searchUser = async(req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Chưa đăng nhập" });

    try {
        const keyword = (req.query.keyword || "").trim();
        if (!keyword) return res.json([]);

        const users = await userDao.searchUsersByKeyword(keyword);
        res.json(users.map((u) => u.username));
    } catch (error) {
        console.error("Lỗi khi tìm user:", error);
        res.status(500).json({ error: error.message });
    }
};

//[POST] /email/send
export const sendEmail = async(req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");

    const t = await sequelize.transaction();

    try {
        const { recipients, title, content } = req.body;
        const senderId = req.session.user.id;

        if (!recipients || !recipients.trim()) throw new Error("Vui lòng nhập ít nhất 1 người nhận.");

        const usernames = [...new Set(recipients.split(",").map((u) => u.trim()).filter((u) => u.length > 0))];
        const users = await userDao.getSearchUser(usernames);

        if (!users.length) throw new Error("Không tìm thấy người nhận hợp lệ.");

        const createdEmails = [];
        for (const receiver of users) {
            const email = await emailDao.saveEmail({
                    sender_id: senderId,
                    receiver_id: receiver.id,
                    title,
                    content,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                t
            );
            createdEmails.push(email);
        }

        await t.commit();

        res.render("pages/emails/sendEmail", {
            success: `Đã gửi ${createdEmails.length} email thành công!`,
            user: req.session.user,
            title: "Soạn Email",
            stats: await userDao.getUnreadStats(senderId),
        });
    } catch (error) {
        if (!t.finished) await t.rollback();
        console.error("Lỗi gửi email nội bộ:", error);

        res.render("pages/emails/sendEmail", {
            error: "Không thể gửi email! " + error.message,
            user: req.session.user,
            title: "Soạn Email",
            stats: { unread: 0 },
        });
    }
};

// Gmail
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// [GET] /email/gmail
export const showGmailForm = async(req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");

    try {
        const stats = await userDao.getUnreadStats(req.session.user.id);
        res.render("pages/emails/sendGmail", {
            user: req.session.user,
            title: "Soạn Email Gmail",
            stats,
        });
    } catch (error) {
        console.error("Lỗi khi tải form Gmail:", error);
        res.render("pages/emails/sendGmail", {
            user: req.session.user,
            title: "Soạn Email Gmail",
            stats: { unread: 0 },
            error: "Không thể tải thông tin người dùng.",
        });
    }
};

// [POST] /email/gmail
export const sendGmail = async(req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");

    try {
        const { recipients, title, content } = req.body;

        if (!recipients || !recipients.trim())
            throw new Error("Vui lòng nhập ít nhất 1 địa chỉ email.");

        // Tạo object Email
        const email = new Email(recipients, title, content);
        const mailOptions = email.buildMailOptions();

        await transporter.sendMail(mailOptions);
        await saveEmailReceivers(email.toEmails, title, content);

        res.render("pages/emails/sendGmail", {
            success: `✅ Đã gửi email tới ${email.toEmails.length} địa chỉ thành công!`,
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


//[GET] /email/sent
export const sent = async(req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");

    try {
        const senderId = req.session.user.id;
        const emailsWithRecipients = await emailDao.getSentEmailsWithRecipients(senderId);

        res.render("pages/emails/sent", {
            emails: emailsWithRecipients,
            user: req.session.user,
            title: "Email đã gửi",
            currentPage: "sent",
            stats: { totalSent: emailsWithRecipients.length },
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách email đã gửi:", error);
        res.render("pages/emails/sent", {
            error: "Không thể tải danh sách email đã gửi: " + error.message,
            emails: [],
            user: req.session.user,
            title: "Email đã gửi",
            currentPage: "sent",
        });
    }
};