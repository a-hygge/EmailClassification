import { Router } from "express";
const router = Router();

import {
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
} from "../controllers/retrainController.js";

router.get("/", showRetrainPage);
router.get("/config", showConfigPage);
router.get("/results", showResultsPage);

router.get("/samples", getSamples);
router.get("/models", getModels);
router.post("/start", startRetraining);
router.get("/status/:jobId", getTrainingStatus);
router.get("/results/:jobId", getTrainingResults);
router.post("/save/:jobId", saveModel);
router.get("/history", getTrainingHistory);

export default router;
