import { Router } from 'express';
const router = Router();

import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import emailRoutes from './emailRoutes.js';

// Public routes
router.use('/auth', authRoutes);

// Protected routes (cần login)
router.use('/dashboard', dashboardRoutes);
router.use('/emails', emailRoutes);

// Home page - redirect
router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/auth/login');
});
export default router;