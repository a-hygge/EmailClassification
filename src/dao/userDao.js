// dao/userDao.js
import db from "../models/index.js";
const { User, EmailRecipient } = db;

/**
 * Lấy thông tin user theo ID
 */
export const getUserById = async(id) => {
    return User.findByPk(id, { raw: true });
};

/**
 * Tìm người dùng theo keyword (username)
 */
export const searchUsersByKeyword = async(keyword, limit = 10) => {
    const { Op } = require("sequelize");
    return User.findAll({
        where: {
            username: {
                [Op.like]: `%${keyword}%` }
        },
        attributes: ["username", "id"],
        limit
    });
};

/**
 * Lấy thống kê email chưa đọc
 */
export const getUnreadStats = async(userId) => {
    const count = await EmailRecipient.count({
        where: {
            userId,
            isRead: 0
        }
    });
    return { unread: count };
};