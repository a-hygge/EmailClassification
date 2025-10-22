import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import { connectDB } from './src/config/database.js';
// import errorMiddleware from './src/middlewares/errorMiddleware.js';


import routes from './src/routes/index.route.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to Database
connectDB();

// View engine setup - EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Method override for PUT/DELETE in forms
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
  res.locals.user = req.session.user || null;
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;
  delete req.session.success;
  delete req.session.error;
  next();
});

// Routes
app.use('/', routes);

// 404 handler
// app.use((req, res) => {
//   res.status(404).render('pages/error', {
//     title: '404 - Page Not Found',
//     message: 'The page you are looking for does not exist.',
//     layout: 'layouts/main'
//   });
// });

// Error handling middleware
// app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});