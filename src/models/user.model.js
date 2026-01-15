import { DataTypes } from "sequelize";

export default (sequelize) => {
    const User = sequelize.define(
        "User", {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            username: { type: DataTypes.STRING(255), allowNull: false },
            password: { type: DataTypes.STRING(255), allowNull: false },
        }, {
            timestamps: true,
            tableName: "user", // ✅ đặt tên bảng thực sự là 'user'
            underscored: true, // created_at, updated_at
        }
    );

    User.associate = (models) => {
        // Một user gửi nhiều email
        User.hasMany(models.Email, {
            as: "SentEmails",
            foreignKey: "sender_id",
        });

        // Một user nhận nhiều email
        User.hasMany(models.Email, {
            as: "ReceivedEmails",
            foreignKey: "receiver_id",
        });
    };

    return User;
};