import { Router } from 'express';
const router = Router();
import { index, getByLabel, show, markAsRead, toggleImportant, deleteEmail, getImportantEmails } from '../controllers/emailController.js';

// GET /emails - Danh sách tất cả email
router.get('/', index);

// GET /emails/label/:labelId - Lọc email theo label
router.get('/label/:labelId', getByLabel);

router.get('/important', getImportantEmails);

// GET /emails/:id - Chi tiết email
router.get('/:id', show);

// GET /emails/:id/:labelId - Chi tiết email với label
router.get('/:id/:labelId', show);

// GET /emails/:id/:labelId - Chi tiết email với label
router.get('/:id/:labelId', show);

// GET /emails/:id/:labelId - Chi tiết email với label
router.get('/:id/:labelId', show);

// PUT /emails/:id/read - Đánh dấu đã đọc
router.put('/:id/read', markAsRead);

// PUT /emails/:id/important - Đánh dấu quan trọng
router.put('/:id/important', toggleImportant);

// DELETE /emails/:emailId - Xóa email
router.delete('/:emailId', deleteEmail);

export default router;