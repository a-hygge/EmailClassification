import { Router } from 'express';
const router = Router();
import { receiveEmail } from '../controllers/apiController.js';

// POST /api/emails/receive - Nhận email từ bên ngoài
router.post('/emails/receive', receiveEmail);

export default router;

