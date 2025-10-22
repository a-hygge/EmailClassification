import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Model = sequelize.define("Model", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    path: { type: DataTypes.STRING(255), allowNull: false },
    version: { type: DataTypes.STRING(255), allowNull: false },
    accuracy: { type: DataTypes.FLOAT(10), allowNull: true },
    precision: { type: DataTypes.FLOAT(10), allowNull: true },
    recall: { type: DataTypes.FLOAT(10), allowNull: true },
    f1Score: { type: DataTypes.FLOAT(10), allowNull: true },
    isActive: { type: DataTypes.INTEGER(10), allowNull: false, defaultValue: 1 },
    datasetId: { type: DataTypes.INTEGER, allowNull: true },
  }, { timestamps: true });

  return Model;
};
