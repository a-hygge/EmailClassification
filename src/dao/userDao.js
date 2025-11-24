// dao/userDao.js
import db from "../models/index.js";
const { User, Email } = db;
import { Op } from "sequelize";

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
 * (Ở đây tạm lấy count email nhận mà chưa đọc dựa vào cột 'is_read' trong Email)
 */
export const getUnreadStats = async(userId) => {
    const count = await Email.count({
        where: {
            receiver_id: userId,
            is_read: 0 // bạn cần thêm cột is_read vào Email nếu muốn track đọc
        }
    });
    return { unread: count };
};

/**
 * Tìm user theo username chính xác
 */
export const findByUsername = async(username) => {
    return User.findOne({ where: { username } });
};

/**
 * Tạo user mới
 */
export const createUser = async(data) => {
    return User.create(data);
};

/**
 * Lấy danh sách user theo username chính xác (dùng khi gửi email)
 * @param {string[]} usernames
 */
export const getSearchUser = async(usernames) => {
    if (!Array.isArray(usernames) || usernames.length === 0) return [];

    return User.findAll({
        where: { username: usernames },
        attributes: ["id", "username"]
    });
};