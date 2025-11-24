import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Gmail = sequelize.define(
        "Gmail", {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

            receiver_email: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },

            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },

            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            }
        }, {
            timestamps: true,
            tableName: "gmail", // bảng thật trong DB
            underscored: true, // created_at, updated_at
        }
    );

    return Gmail;
};