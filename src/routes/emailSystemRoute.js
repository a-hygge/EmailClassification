import { getAllEmails } from '../controllers/emailSystemController.js';

import { Router } from 'express';
const router = Router();

// GET /emailsSystem - Danh sách tất cả email system
router.get('/', getAllEmails);

export default router;