/**
 * Classification Service
 * Handles email classification logic
 */
import mlApiClient from "./mlApiClient.js";
import labelDao from "../dao/labelDao.js";
import emailDao from "../dao/emailDao.js";

class ClassificationService {
  async classifyEmail(emailData) {
    try {
      // Validate input
      if (!emailData.title || !emailData.content) {
        throw new Error("Title and content are required");
      }

      // Call ML Service
      const prediction = await mlApiClient.predict({
        title: emailData.title,
        content: emailData.content,
      });

      let databaseLabelId = null;

      if (prediction.labelName) {
        const label = await labelDao.findByName(prediction.labelName);

        if (label) {
          databaseLabelId = label.id;
        } else {
          console.warn(`Label "${prediction.labelName}" not found in database`);
        }
      }

      return {
        success: true,
        labelId: databaseLabelId, // Database Label.id
        labelName: prediction.labelName, // Label name from ML model
        mlLabelId: prediction.labelId, // ML model's label_id (0-6)
        confidence: prediction.confidence,
      };
    } catch (error) {
      console.error("Classification error:", error);
      return {
        success: false,
        error: error.message,
        labelId: null,
        confidence: 0,
      };
    }
  }

  async classifyAndUpdate(emailId) {
    try {
      const email = await emailDao.findById(emailId);

      if (!email) {
        throw new Error("Email not found");
      }

      const result = await this.classifyEmail({
        title: email.title,
        content: email.content,
      });

      // Update email with classification result if successful
      if (result.success && result.labelId) {
        await emailDao.updateLabel(emailId, result.labelId);
      }

      return result;
    } catch (error) {
      console.error("Classify and update error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new ClassificationService();
