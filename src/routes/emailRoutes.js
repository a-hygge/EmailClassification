import { Router } from 'express';
const router = Router();
import { index, getByLabel, show, markAsRead, toggleImportant, deleteEmail } from '../controllers/emailController.js';

// GET /emails - Danh sách tất cả email
router.get('/', index);

// GET /emails/label/:labelId - Lọc email theo label
router.get('/label/:labelId', getByLabel);

// GET /emails/:id - Chi tiết email
router.get('/:id', show);

// PUT /emails/:id/read - Đánh dấu đã đọc
router.put('/:id/read', markAsRead);

// PUT /emails/:id/important - Đánh dấu quan trọng
router.put('/:id/important', toggleImportant);

// DELETE /emails/:emailId - Xóa email
router.delete('/:emailId', deleteEmail);

export default router;