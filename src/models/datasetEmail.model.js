import { DataTypes } from "sequelize";

export default (sequelize) => {
  const DatasetEmail = sequelize.define("DatasetEmail", {
    tblDatasetId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      primaryKey: true
    },
    tblEmailId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      primaryKey: true
    },
  }, { 
    timestamps: false,
    tableName: 'tblDatasetEmail'
  });

  return DatasetEmail;
};
