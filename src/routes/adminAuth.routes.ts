import { Router } from 'express';
import { adminLogin, adminLogout, getAdminProfile } from '../controllers/adminAuth.controller';
import { authenticateJwt } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { loginRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public Admin Login Endpoints (NO authentication token required)
router.post('/login', loginRateLimiter, adminLogin);

// Browser GET /api/admin/auth/login → redirect to frontend login page
router.get('/login', (req, res) => {
  const acceptHeader = req.headers.accept || '';
  if (acceptHeader.includes('text/html')) {
    return res.redirect('/login');
  }
  res.status(405).json({
    success: false,
    message: 'Method Not Allowed. GET request is not supported on /api/admin/auth/login. Please send a POST request with JSON body {"email": "...", "password": "..."}.',
    method: 'POST',
    endpoint: '/api/admin/auth/login',
  });
});

// Protected Admin Auth Endpoints (Token required)
router.post('/logout', authenticateJwt, requireAdmin, adminLogout);
router.get('/me', authenticateJwt, requireAdmin, getAdminProfile);

export default router;
