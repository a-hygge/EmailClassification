import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userDao from '../dao/userDao.js';

// [GET] /auth/login
export const showLoginPage = (req, res) => {
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
};

// [POST] /auth/login
export const login = async(req, res) => {
    try {
        const { username, password, remember } = req.body;

        const user = await userDao.findByUsername(username);

        if (!user) {
            return res.render('pages/auth/login', {
                title: 'Login - Email Classification System',
                layout: 'layouts/auth',
                error: 'Username hoặc mật khẩu không chính xác',
                oldInput: { username }
            });
        }

        // So sánh mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render('pages/auth/login', {
                title: 'Login - Email Classification System',
                layout: 'layouts/auth',
                error: 'Username hoặc mật khẩu không chính xác',
                oldInput: { username }
            });
        }

        // Tạo JWT token
        const token = jwt.sign({ id: user.id, username: user.username },
            process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE }
        );

        // Lưu vào session
        req.session.user = {
            id: user.id,
            username: user.username
        };

        // Ghi nhớ đăng nhập
        if (remember) {
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
                secure: process.env.NODE_ENV === 'production'
            });
        }

        req.session.success = 'Đăng nhập thành công!';
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
};

// [GET] /auth/register
export const showRegisterPage = (req, res) => {
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
};

// [POST] /auth/register
export const register = async(req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await userDao.findByUsername(username);
        if (existingUser) {
            return res.render('pages/auth/register', {
                title: 'Register - Email Classification System',
                layout: 'layouts/auth',
                error: 'Username này đã được sử dụng',
                errors: {},
                oldInput: { username }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await userDao.createUser({ username, password: hashedPassword });

        req.session.success = 'Đăng ký thành công! Vui lòng đăng nhập.';
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
};

// [GET] /auth/logout
export const logout = async(req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) console.error('Logout error:', err);

            res.clearCookie('token');
            res.clearCookie('connect.sid');
            res.redirect('/auth/login');
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.redirect('/auth/login');
    }
};

// [GET] /auth/forgot-password
export const showForgotPasswordPage = (req, res) => {
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
};

export default {
    showLoginPage,
    login,
    showRegisterPage,
    register,
    logout,
    showForgotPasswordPage
};