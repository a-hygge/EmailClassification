import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Dataset = sequelize.define("Dataset", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    path: { type: DataTypes.STRING(255), allowNull: false },
  }, { timestamps: true });

  return Dataset;
};
