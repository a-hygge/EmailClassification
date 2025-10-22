import { Router } from 'express';
const router = Router();

import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
// const emailRoutes = require('./emailRoutes');

// Public routes
router.use('/auth', authRoutes);

router.use('/dashboard', dashboardRoutes);

// router.use('/emails', emailRoutes);

// Home page - redirect
router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/auth/login');
});

export default router;