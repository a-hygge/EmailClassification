import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Email = sequelize.define(
    "Email",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      labelId: { type: DataTypes.INTEGER, allowNull: true },
      userId: { type: DataTypes.INTEGER, allowNull: true },
      datasetId: { type: DataTypes.INTEGER, allowNull: true },
    },
    { timestamps: true }
  );

  return Email;
};