import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  getSession,
} from '../controllers/completeAuth.controller';
import { authenticateJwt } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public Authentication Endpoints
router.post('/register', register);
router.post('/signup', register);
router.post('/login', loginRateLimiter, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', loginRateLimiter, forgotPassword);
router.post('/reset-password', loginRateLimiter, resetPassword);

// Browser GET GET /login redirect handler
router.get('/login', (req, res) => {
  const acceptHeader = req.headers.accept || '';
  if (acceptHeader.includes('text/html')) {
    return res.redirect('/login');
  }
  res.status(405).json({
    success: false,
    message: 'Method Not Allowed. Send a POST request with JSON body {"email": "...", "password": "..."}.',
  });
});

// Protected Authentication Endpoints
router.post('/change-password', authenticateJwt, changePassword);
router.get('/me', authenticateJwt, getMe);
router.get('/session', authenticateJwt, getSession);

export default router;
