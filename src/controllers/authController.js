import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const { User } = db;

class AuthController {
  // GET /auth/login
  showLoginPage(req, res) {
    try {
      res.render('pages/auth/login', {
        title: 'Login - Email Classification System',
        layout: 'layouts/auth',
        error: null,
        oldInput: {}
      });
    } catch (error) {
      console.error('Error showing login page:', error);
      res.status(500).send('Server Error');
    }
  }

  // POST /auth/login
  async login(req, res) {
    try {
      const { username, password, remember } = req.body;

      // Tìm user theo 
      const user = await User.findOne({
        where: { username: username }
      });

      // Kiểm tra user tồn tại


      if (!user) {
        return res.render('pages/auth/login', {
          title: 'Login - Email Classification System',
          layout: 'layouts/auth',
          error: 'Username hoặc mật khẩu không chính xác',
          oldInput: { username }
        });
      }

      // Kiểm tra password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.render('pages/auth/login', {
          title: 'Login - Email Classification System',
          layout: 'layouts/auth',
          error: 'Username hoặc mật khẩu không chính xác',
          oldInput: { username }
        });
      }

      // Tạo JWT token (nếu dùng API)
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      // Lưu thông tin user vào session
      req.session.user = {
        id: user.id,
        username: user.username,
        // email: user.email,
        // full_name: user.full_name,
        // avatar: user.avatar,
        // role: user.role
      };

      // Lưu token vào cookie nếu chọn "Remember me"
      if (remember) {
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          secure: process.env.NODE_ENV === 'production'
        });
      }

      // Update last login
      // await user.update({ last_login: new Date() });

      // Set success message
      req.session.success = 'Đăng nhập thành công!';

      // Redirect to dashboard
      res.redirect('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      res.render('pages/auth/login', {
        title: 'Login - Email Classification System',
        layout: 'layouts/auth',
        error: 'Có lỗi xảy ra, vui lòng thử lại',
        oldInput: { username: req.body.username }
      });
    }
  }

  // GET /auth/register
  showRegisterPage(req, res) {
    try {
      res.render('pages/auth/register', {
        title: 'Register - Email Classification System',
        layout: 'layouts/auth',
        error: null,
        errors: {},
        oldInput: {}
      });
    } catch (error) {
      console.error('Error showing register page:', error);
      res.status(500).send('Server Error');
    }
  }

  // POST /auth/register
  async register(req, res) {
    try {
      const { username, password } = req.body;

      // Kiểm tra email đã tồn tại
      // const existingUser = await User.findOne({
      //   where: { username: username.toLowerCase() }
      // });

      // if (existingUser) {
      //   return res.render('pages/auth/register', {
      //     title: 'Register - Email Classification System',
      //     layout: 'layouts/auth',
      //     error: 'Email này đã được sử dụng',
      //     errors: {},
      //     oldInput: { username, email, full_name }
      //   });
      // }

      // Kiểm tra username đã tồn tại
      const existingUsername = await User.findOne({
        where: { username }
      });

      if (existingUsername) {
        return res.render('pages/auth/register', {
          title: 'Register - Email Classification System',
          layout: 'layouts/auth',
          error: 'Username này đã được sử dụng',
          errors: {},
          oldInput: { username, email, full_name }
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo user mới
      const newUser = await User.create({
        username,
        password: hashedPassword
      });

      // Set success message
      req.session.success = 'Đăng ký thành công! Vui lòng đăng nhập.';

      // Redirect to login
      res.redirect('/auth/login');

    } catch (error) {
      console.error('Register error:', error);
      res.render('pages/auth/register', {
        title: 'Register - Email Classification System',
        layout: 'layouts/auth',
        error: 'Có lỗi xảy ra, vui lòng thử lại',
        errors: {},
        oldInput: req.body
      });
    }
  }

  // GET /auth/logout
  async logout(req, res) {
    try {
      // Xóa session
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
        }
        // Xóa cookie
        res.clearCookie('token');
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.redirect('/auth/login');
    }
  }

  // GET /auth/forgot-password
  showForgotPasswordPage(req, res) {
    try {
      res.render('pages/auth/forgot-password', {
        title: 'Forgot Password - Email Classification System',
        layout: 'layouts/auth',
        error: null,
        success: null,
        oldInput: {}
      });
    } catch (error) {
      console.error('Error showing forgot password page:', error);
      res.status(500).send('Server Error');
    }
  }
}

const authController = new AuthController();

export const {
  showLoginPage,
  login,
  showRegisterPage,
  register,
  logout,
  showForgotPasswordPage
} = authController;

export default authController;