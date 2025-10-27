import { Router } from 'express';
const router = Router();

import {
  showRetrainPage,
  getSamples,
  startRetraining,
  getTrainingStatus,
  getTrainingResults,
  saveModel,
  getTrainingHistory
} from '../controllers/retrainController.js';

// Main retrain page
router.get('/', showRetrainPage);

// Get samples for selection
router.get('/samples', getSamples);

// Start training
router.post('/start', startRetraining);

// Get training status
router.get('/status/:jobId', getTrainingStatus);

// Get training results
router.get('/results/:jobId', getTrainingResults);

// Save trained model
router.post('/save/:jobId', saveModel);

// Get training history
router.get('/history', getTrainingHistory);

export default router;

