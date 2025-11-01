/*import { DataTypes } from "sequelize";

export default (sequelize) => {
    const EmailRecipient = sequelize.define("EmailRecipient", {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        sendTime: { type: DataTypes.DATE, allowNull: false },
        isRead: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
        isImportant: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
        emailId: { type: DataTypes.INTEGER, allowNull: false },
        userId: { type: DataTypes.INTEGER, allowNull: false },
    }, { timestamps: true });

    return EmailRecipient;
};*/

import { DataTypes } from "sequelize";

export default (sequelize) => {
    const EmailRecipient = sequelize.define("EmailRecipient", {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        sendTime: { type: DataTypes.DATE, allowNull: false },
        isRead: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
        isImportant: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },

        emailId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'email',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },

        userId: { type: DataTypes.INTEGER, allowNull: false },
    }, { timestamps: true });

    return EmailRecipient;
};