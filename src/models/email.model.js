import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Email = sequelize.define(
        "Email", {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            title: { type: DataTypes.STRING(255), allowNull: false },
            content: { type: DataTypes.TEXT, allowNull: false },

            sender_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "user",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            receiver_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "user",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            dataset_id: { type: DataTypes.INTEGER, allowNull: true },

            is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            is_important: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        }, {
            timestamps: true,
            tableName: "email",
            underscored: true, // created_at, updated_at
        }
    );

    Email.associate = (models) => {
        // Người gửi
        Email.belongsTo(models.User, {
            as: "Sender",
            foreignKey: "sender_id",
        });

        // Người nhận
        Email.belongsTo(models.User, {
            as: "Receiver",
            foreignKey: "receiver_id",
        });

    };

    return Email;
};