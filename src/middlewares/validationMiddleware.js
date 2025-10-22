import { body, validationResult } from 'express-validator';

// Validation cho login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

  // Middleware xử lý lỗi validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      return res.render('pages/auth/login', {
        title: 'Login - Email Classification System',
        layout: 'layouts/auth',
        error: errorMessages[0],
        oldInput: req.body
      });
    }
    next();
  }
];

// Validation cho register
const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username không được để trống')
    .isLength({ min: 3, max: 50 }).withMessage('Username phải từ 3-50 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username chỉ chứa chữ, số và dấu gạch dưới'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

  body('confirm_password')
    .trim()
    .notEmpty().withMessage('Vui lòng xác nhận mật khẩu')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      return true;
    }),

  body('full_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Họ tên không được quá 100 ký tự'),

  // Middleware xử lý lỗi validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorObj = {};
      errors.array().forEach(err => {
        errorObj[err.path] = err.msg;
      });

      return res.render('pages/auth/register', {
        title: 'Register - Email Classification System',
        layout: 'layouts/auth',
        error: errors.array()[0].msg,
        errors: errorObj,
        oldInput: req.body
      });
    }
    next();
  }
];

export {
  validateLogin,
  validateRegister
};