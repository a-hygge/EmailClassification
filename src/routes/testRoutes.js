/**
 * Test Routes
 * Routes for testing features
 */
import { Router } from 'express';
import { showTestPage, testClassify } from '../controllers/testClassificationController.js';

const router = Router();

// GET /test/classify - Show test classification page
router.get('/classify', showTestPage);

// POST /test/classify - Test email classification
router.post('/classify', testClassify);

export default router;

