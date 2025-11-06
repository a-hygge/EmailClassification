import emailDao from '../dao/emailDao.js';
import classificationService from '../services/classificationService.js';

class ApiController {
  /**
   * POST /api/emails/receive
   * Nhận email từ bên ngoài, validate, lưu vào database và phân loại
   */
  async receiveEmail(req, res) {
    try {
      const { from, to, subject, body } = req.body;

      // Validate input
      if (!from || !to || !subject || !body) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: from, to, subject, body'
        });
      }

      // Validate email format for 'from'
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(from)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format for "from" field'
        });
      }

      // Validate email format for 'to'
      if (!emailRegex.test(to)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format for "to" field'
        });
      }

      // Validate subject and body length
      if (subject.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Subject cannot be empty'
        });
      }

      if (body.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Body cannot be empty'
        });
      }

      // Lưu email vào database (chưa có label)
      const email = await emailDao.create({
        title: subject,
        content: body,
        sender: from,
        receiver: to,
        tblLabelId: null
      });

      // Gọi Classification Service để phân loại
      const classificationResult = await classificationService.classifyEmail({
        title: subject,
        content: body
      });

      // Cập nhật label cho email nếu phân loại thành công
      if (classificationResult.success && classificationResult.labelId) {
        await emailDao.updateLabel(email.id, classificationResult.labelId);
      }

      // Trả về kết quả
      return res.status(201).json({
        success: true,
        message: 'Email received and classified successfully',
        data: {
          emailId: email.id,
          from: from,
          to: to,
          subject: subject,
          classification: {
            labelId: classificationResult.labelId,
            labelName: classificationResult.labelName,
            confidence: classificationResult.confidence
          }
        }
      });

    } catch (error) {
      console.error('Receive email error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}

const apiController = new ApiController();

export const { receiveEmail } = apiController;

export default apiController;

