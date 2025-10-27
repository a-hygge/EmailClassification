import { DataTypes } from "sequelize";

export default (sequelize) => {
  const TrainingJob = sequelize.define("TrainingJob", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    userId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    modelType: { 
      type: DataTypes.STRING(50), 
      allowNull: false,
      comment: 'cnn, rnn, lstm, bilstm, bilstm+cnn'
    },
    status: { 
      type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'), 
      allowNull: false,
      defaultValue: 'pending'
    },
    hyperparameters: { 
      type: DataTypes.JSON, 
      allowNull: true,
      comment: 'learning_rate, epochs, batch_size, random_state'
    },
    sampleIds: { 
      type: DataTypes.JSON, 
      allowNull: true,
      comment: 'Array of email IDs used for training'
    },
    results: { 
      type: DataTypes.JSON, 
      allowNull: true,
      comment: 'accuracy, precision, recall, f1, history'
    },
    modelPath: { 
      type: DataTypes.STRING(255), 
      allowNull: true 
    },
  }, { 
    timestamps: true,
    tableName: 'training_job'
  });

  return TrainingJob;
};

