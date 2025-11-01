/**
 * Retrain Controller
 * Handles HTTP requests for model retraining
 */
import retrainService from "../services/retrainService.js";
import emailDAO from "../dao/emailDAO.js";
import labelDao from "../dao/labelDao.js";
import modelDao from "../dao/modelDao.js";
import db from "../models/index.js";

class RetrainController {
  /**
   * GET /retrain - Show sample selection page (Step 1)
   */
  async showRetrainPage(req, res) {
    try {
      const stats = req.session.stats || {};
      const labelsWithCount = req.session.labelsWithCount || [];

      res.render("pages/retrain/samples", {
        title: "Select Training Samples - Email Classification System",
        layout: "layouts/main",
        currentPage: "retrain",
        stats,
        labels: labelsWithCount,
        selectedLabel: null,
      });
    } catch (error) {
      console.error("Error showing retrain page:", error);
      res.status(500).send("Server Error");
    }
  }

  /**
   * GET /retrain/config - Show configuration page (Step 2)
   */
  async showConfigPage(req, res) {
    try {
      const stats = req.session.stats || {};
      const labelsWithCount = req.session.labelsWithCount || [];

      res.render("pages/retrain/config", {
        title: "Configure Training - Email Classification System",
        layout: "layouts/main",
        currentPage: "retrain",
        stats,
        labels: labelsWithCount,
        selectedLabel: null,
      });
    } catch (error) {
      console.error("Error showing config page:", error);
      res.status(500).send("Server Error");
    }
  }

  /**
   * GET /retrain/results - Show results page (Step 3)
   */
  async showResultsPage(req, res) {
    try {
      const stats = req.session.stats || {};
      const labelsWithCount = req.session.labelsWithCount || [];
      const jobId = req.query.jobId || null;

      res.render("pages/retrain/results", {
        title: "Training Results - Email Classification System",
        layout: "layouts/main",
        currentPage: "retrain",
        stats,
        labels: labelsWithCount,
        jobId,
        selectedLabel: null,
      });
    } catch (error) {
      console.error("Error showing results page:", error);
      res.status(500).send("Server Error");
    }
  }

  /**
   * GET /retrain/samples - Get all samples for selection
   */
  async getSamples(req, res) {
    try {
      const samples = await emailDAO.findAll({
        include: [{ model: db.Label, as: "Label" }],
        order: [["createdAt", "DESC"]],
        limit: 10000, // Limit for performance
      });

      const labels = await labelDao.findAll();

      const formattedSamples = samples.map((email) => ({
        id: email.id,
        title: email.title,
        content: email.content.substring(0, 100) + "...", // Preview
        labelId: email.labelId,
        labelName: email.Label?.name || "Unknown",
      }));

      res.json({
        success: true,
        samples: formattedSamples,
        labels: labels.map((l) => ({ id: l.id, name: l.name })),
      });
    } catch (error) {
      console.error("Error getting samples:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /retrain/models - Get available models for selection
   */
  async getModels(req, res) {
    try {
      const models = await modelDao.findAllActive();

      res.json({
        success: true,
        models: models.map((m) => ({
          id: m.id,
          name: m.version,
          path: m.path,
          accuracy: m.accuracy,
          precision: m.precision,
          recall: m.recall,
          f1Score: m.f1Score,
        })),
      });
    } catch (error) {
      console.error("Error getting models:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /retrain/start - Start training
   */
  async startRetraining(req, res) {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.user || !req.session.user.id) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized. Please login again.",
        });
      }

      const userId = req.session.user.id;
      const config = req.body;

      const result = await retrainService.startTraining(userId, config);
      res.json(result);
    } catch (error) {
      console.error("Error starting training:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /retrain/status/:jobId - Get training status
   */
  async getTrainingStatus(req, res) {
    try {
      const { jobId } = req.params;
      const result = await retrainService.getTrainingStatus(parseInt(jobId));
      res.json(result);
    } catch (error) {
      console.error("Error getting training status:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /retrain/results/:jobId - Get training results
   */
  async getTrainingResults(req, res) {
    try {
      const { jobId } = req.params;
      const result = await retrainService.getTrainingResults(parseInt(jobId));
      res.json(result);
    } catch (error) {
      console.error("Error getting training results:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /retrain/save/:jobId - Save trained model
   */
  async saveModel(req, res) {
    try {
      const { jobId } = req.params;
      const { modelName } = req.body;

      const result = await retrainService.saveModel(
        parseInt(jobId),
        modelName || `model_${Date.now()}`
      );

      res.json(result);
    } catch (error) {
      console.error("Error saving model:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /retrain/history - Get training history
   */
  async getTrainingHistory(req, res) {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.user || !req.session.user.id) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized. Please login again.",
        });
      }

      const userId = req.session.user.id;
      const jobs = await retrainService.getUserTrainingHistory(userId);

      res.json({
        success: true,
        jobs: jobs,
      });
    } catch (error) {
      console.error("Error getting training history:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

const retrainController = new RetrainController();

export const {
  showRetrainPage,
  showConfigPage,
  showResultsPage,
  getSamples,
  getModels,
  startRetraining,
  getTrainingStatus,
  getTrainingResults,
  saveModel,
  getTrainingHistory,
} = retrainController;

export default retrainController;
