import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const BlackListToken = sequelize.define("BlackListToken", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    token: { type: DataTypes.STRING(255), allowNull: false },
    expired_at: { type: DataTypes.DATE, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  }, { timestamps: true });

  return BlackListToken;
};
