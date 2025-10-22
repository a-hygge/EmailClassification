import { sequelize } from '../config/database.js';

// Import các model
import UserModel from "./user.model.js";
import EmailModel from "./email.model.js";
import EmailRecipientModel from "./emailRecipient.model.js";
import DatasetModel from "./dataset.model.js";
import ModelModel from "./model.model.js";
import LabelModel from "./label.model.js";
import BlackListTokenModel from "./blackListToken.model.js";

const User = UserModel(sequelize);
const Email = EmailModel(sequelize);
const EmailRecipient = EmailRecipientModel(sequelize);
const Dataset = DatasetModel(sequelize);
const Model = ModelModel(sequelize);
const Label = LabelModel(sequelize);
const BlackListToken = BlackListTokenModel(sequelize);

// ------------------ Thiết lập mối quan hệ ------------------

// User - Email
User.hasMany(Email, { foreignKey: "userId" });
Email.belongsTo(User, { foreignKey: "userId" });

// Label - Email
Label.hasMany(Email, { foreignKey: "labelId" });
Email.belongsTo(Label, { foreignKey: "labelId" });

// Dataset - Email
Dataset.hasMany(Email, { foreignKey: "datasetId" });
Email.belongsTo(Dataset, { foreignKey: "datasetId" });

// Dataset - Model
Dataset.hasMany(Model, { foreignKey: "datasetId" });
Model.belongsTo(Dataset, { foreignKey: "datasetId" });

// EmailRecipient - User
User.hasMany(EmailRecipient, { foreignKey: "userId" });
EmailRecipient.belongsTo(User, { foreignKey: "userId" });

// EmailRecipient - Email
Email.hasMany(EmailRecipient, { foreignKey: "emailId" });
EmailRecipient.belongsTo(Email, { foreignKey: "emailId" });

// BlackListToken - User
User.hasMany(BlackListToken, { foreignKey: "userId" });
BlackListToken.belongsTo(User, { foreignKey: "userId" });

// ------------------------------------------------------------

export default {
  sequelize,
  User,
  Email,
  EmailRecipient,
  Dataset,
  Model,
  Label,
  BlackListToken,
};
