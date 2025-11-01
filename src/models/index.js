import { sequelize } from '../config/database.js';

// Import các model
import UserModel from "./user.model.js";
import EmailModel from "./email.model.js";
import EmailUserModel from "./emailUser.model.js";
import DatasetModel from "./dataset.model.js";
import DatasetEmailModel from "./datasetEmail.model.js";
import ModelModel from "./model.model.js";
import LabelModel from "./label.model.js";
import TrainingJobModel from "./trainingJob.model.js";

const User = UserModel(sequelize);
const Email = EmailModel(sequelize);
const EmailUser = EmailUserModel(sequelize);
const Dataset = DatasetModel(sequelize);
const DatasetEmail = DatasetEmailModel(sequelize);
const Model = ModelModel(sequelize);
const Label = LabelModel(sequelize);
const TrainingJob = TrainingJobModel(sequelize);

// ------------------ Thiết lập mối quan hệ ------------------

// Label - Email (1-n)
Label.hasMany(Email, { foreignKey: "tblLabelId", as: "emails" });
Email.belongsTo(Label, { foreignKey: "tblLabelId", as: "label" });

// Dataset - Model (1-n)
Dataset.hasMany(Model, { foreignKey: "tblDatasetId", as: "models" });
Model.belongsTo(Dataset, { foreignKey: "tblDatasetId", as: "dataset" });

// User - TrainingJob (1-n)
User.hasMany(TrainingJob, { foreignKey: "tblUserId", as: "trainingJobs" });
TrainingJob.belongsTo(User, { foreignKey: "tblUserId", as: "user" });

// User - Email (n-n qua EmailUser)
User.belongsToMany(Email, { 
  through: EmailUser, 
  foreignKey: "tblUserId",
  otherKey: "tblEmailId",
  as: "emails" 
});
Email.belongsToMany(User, { 
  through: EmailUser, 
  foreignKey: "tblEmailId",
  otherKey: "tblUserId",
  as: "users" 
});

// Dataset - Email (n-n qua DatasetEmail)
Dataset.belongsToMany(Email, { 
  through: DatasetEmail, 
  foreignKey: "tblDatasetId",
  otherKey: "tblEmailId",
  as: "emails" 
});
Email.belongsToMany(Dataset, { 
  through: DatasetEmail, 
  foreignKey: "tblEmailId",
  otherKey: "tblDatasetId",
  as: "datasets" 
});

// ------------------------------------------------------------

export default {
  sequelize,
  User,
  Email,
  EmailUser,
  Dataset,
  DatasetEmail,
  Model,
  Label,
  TrainingJob,
};
