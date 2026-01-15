import { sequelize } from '../config/database.js';

// Import các model
import UserModel from "./user.model.js";
import EmailModel from "./email.model.js";
import DatasetModel from "./dataset.model.js";
import ModelModel from "./model.model.js";
import LabelModel from "./label.model.js";
import BlackListTokenModel from "./blackListToken.model.js";
import TrainingJobModel from "./trainingJob.model.js";
import GmailModel from "./Gmail.js";


// Khởi tạo các model
const User = UserModel(sequelize);
const Email = EmailModel(sequelize);
const Dataset = DatasetModel(sequelize);
const Model = ModelModel(sequelize);
const Label = LabelModel(sequelize);
const BlackListToken = BlackListTokenModel(sequelize);
const TrainingJob = TrainingJobModel(sequelize);
const Gmail = GmailModel(sequelize);


// ------------------ Thiết lập mối quan hệ ------------------

// User - Email
User.hasMany(Email, { foreignKey: "sender_id", as: "SentEmails" });
User.hasMany(Email, { foreignKey: "receiver_id", as: "ReceivedEmails" });
Email.belongsTo(User, { foreignKey: "sender_id", as: "Sender" });
Email.belongsTo(User, { foreignKey: "receiver_id", as: "Receiver" });

// Label - Email
Label.hasMany(Email, { foreignKey: "label_id", as: "emails" });
Email.belongsTo(Label, { foreignKey: "label_id", as: "label" });

// Dataset - Email
Dataset.hasMany(Email, { foreignKey: "dataset_id", as: "emails" });
Email.belongsTo(Dataset, { foreignKey: "dataset_id", as: "dataset" });

// Dataset - Model
Dataset.hasMany(Model, { foreignKey: "dataset_id", as: "models" });
Model.belongsTo(Dataset, { foreignKey: "dataset_id", as: "dataset" });

// BlackListToken - User
User.hasMany(BlackListToken, { foreignKey: "user_id", as: "blackListTokens" });
BlackListToken.belongsTo(User, { foreignKey: "user_id", as: "user" });

// TrainingJob - User
User.hasMany(TrainingJob, { foreignKey: "user_id", as: "trainingJobs" });
TrainingJob.belongsTo(User, { foreignKey: "user_id", as: "user" });

// ------------------------------------------------------------

export default {
    sequelize,
    User,
    Email,
    Dataset,
    Model,
    Label,
    BlackListToken,
    TrainingJob,
    Gmail,
};