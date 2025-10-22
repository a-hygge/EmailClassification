import { Router } from 'express';
import { index } from '../controllers/dashboardController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = Router();
// Tất cả routes trong này đều cần authentication
router.use(isAuthenticated);

// GET /dashboard
router.get('/', index);

export default router;