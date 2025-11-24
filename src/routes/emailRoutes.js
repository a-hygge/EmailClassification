import { Router } from 'express';
const router = Router();
import { index, show, markAsRead, toggleImportant, deleteEmail } from '../controllers/emailController.js'; // bỏ getByLabel, getImportantEmails

// GET /emails - Danh sách tất cả email
router.get('/', index);

// GET /emails/:id - Chi tiết email
router.get('/:id', show);

// GET /emails/:id/:labelId - Chi tiết email với label (nếu vẫn muốn giữ param labelId)
router.get('/:id/:labelId', show);

// PUT /emails/:id/read - Đánh dấu đã đọc
router.put('/:id/read', markAsRead);

// PUT /emails/:id/important - Đánh dấu quan trọng
router.put('/:id/important', toggleImportant);

// DELETE /emails/:emailId - Xóa email
router.delete('/:emailId', deleteEmail);

export default router;