import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Model = sequelize.define("Model", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    path: { type: DataTypes.STRING(255), allowNull: true },
    version: { type: DataTypes.STRING(50), allowNull: true },
    accuracy: { type: DataTypes.FLOAT(10), allowNull: true },
    precision: { type: DataTypes.FLOAT(10), allowNull: true },
    recall: { type: DataTypes.FLOAT(10), allowNull: true },
    f1Score: { type: DataTypes.FLOAT(10), allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: true },
    updatedAt: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: true },
    tblDatasetId: { type: DataTypes.INTEGER, allowNull: true },
  }, { 
    timestamps: false,
    tableName: 'tblModel'
  });

  return Model;
};
