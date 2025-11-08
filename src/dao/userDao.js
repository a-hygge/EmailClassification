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
                [Op.like]: `%${keyword}%`
            }
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

export const findByUsername = async(username) => {
    return await User.findOne({ where: { username } });
};

export const createUser = async(data) => {
    return await User.create(data);
};

/**
 * Lấy danh sách user theo username chính xác (dùng khi gửi email)
 * @param {string[]} usernames
 * @returns {Promise<Array>}
 */
export const getSearchUser = async(usernames) => {
    if (!Array.isArray(usernames) || usernames.length === 0) {
        return [];
    }

    return User.findAll({
        where: { username: usernames },
        attributes: ["id", "username"]
    });
};