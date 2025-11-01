/*import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import { connectDB } from './src/config/database.js';

import routes from './src/routes/index.route.js';
import sendEmailRoute from "./src/routes/sendEmailRoute.js";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to Database
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Method override
app.use(methodOverride('_method'));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Make user available to all views
app.use((req, res, next) => {
    // Lấy user từ session nếu đã login
    res.locals.user = req.session.user || null;
    res.locals.success = req.session.success;
    res.locals.error = req.session.error;

    // Xóa flash message sau khi lấy
    delete req.session.success;
    delete req.session.error;

    next();
});

// Middleware kiểm tra đăng nhập
export const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    req.session.error = "Bạn cần đăng nhập để truy cập trang này.";
    res.redirect('/auth/login');
};

// Routes
app.use('/', routes); // route chính (login, register, home,...)
app.use("/email", isAuthenticated, sendEmailRoute); // bảo vệ route email

// 404 handler
app.use((req, res) => {
    res.status(404).render('pages/error', {
        title: '404 - Page Not Found',
        message: 'The page you are looking for does not exist.',
        layout: 'layouts/main'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
});*/
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import { connectDB } from './src/config/database.js';

import routes from './src/routes/index.route.js';
import sendEmailRoute from "./src/routes/sendEmailRoute.js";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect DB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Method override
app.use(methodOverride('_method'));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }
}));

// Make user available to all views
app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
    } else {
        res.locals.user = null;
    }
    res.locals.success = req.session.success;
    res.locals.error = req.session.error;
    delete req.session.success;
    delete req.session.error;
    next();
});

// Routes
app.use('/', routes);
app.use("/email", sendEmailRoute); // session tự kiểm tra trong controller

// 404 handler
app.use((req, res) => {
    res.status(404).render('pages/error', {
        title: '404 - Page Not Found',
        message: 'The page you are looking for does not exist.',
        layout: 'layouts/main'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
});