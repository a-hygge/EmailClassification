import { DataTypes } from "sequelize";

export default (sequelize) => {
  const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(255), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
  }, { timestamps: true });

  return User;
};
