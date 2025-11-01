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
User.hasMany(Email, { foreignKey: "userId", as: "emails" });
Email.belongsTo(User, { foreignKey: "userId", as: "user" });

// Label - Email
Label.hasMany(Email, { foreignKey: "labelId", as: "emails" });
Email.belongsTo(Label, { foreignKey: "labelId", as: "Label" });

// Dataset - Email
Dataset.hasMany(Email, { foreignKey: "datasetId", as: "emails" });
Email.belongsTo(Dataset, { foreignKey: "datasetId", as: "dataset" });

// Dataset - Model
Dataset.hasMany(Model, { foreignKey: "datasetId", as: "models" });
Model.belongsTo(Dataset, { foreignKey: "datasetId", as: "dataset" });

// EmailRecipient - User
User.hasMany(EmailRecipient, { foreignKey: "userId", as: "emailRecipients" });
EmailRecipient.belongsTo(User, { foreignKey: "userId", as: "user" });

// EmailRecipient - Email
Email.hasMany(EmailRecipient, { foreignKey: "emailId", as: "recipients" });
EmailRecipient.belongsTo(Email, { foreignKey: "emailId", as: "email" });

// BlackListToken - User
User.hasMany(BlackListToken, { foreignKey: "userId", as: "blackListTokens" });
BlackListToken.belongsTo(User, { foreignKey: "userId", as: "user" });

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