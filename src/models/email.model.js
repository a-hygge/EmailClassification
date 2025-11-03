import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Email = sequelize.define(
    "Email",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING(255), allowNull: true },
      content: { type: DataTypes.STRING(5000), allowNull: true },
      tblLabelId: { type: DataTypes.INTEGER, allowNull: true },
    },
    { 
      timestamps: false,
      tableName: 'tblEmail'
    }
  );

  return Email;
};
