import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Label = sequelize.define("Label", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
  }, { timestamps: true });

  return Label;
};
