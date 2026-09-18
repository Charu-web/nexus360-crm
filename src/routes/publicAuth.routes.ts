import { Router } from 'express';
import {
  publicSignup,
  publicLogin,
  publicMe,
  publicLogout,
} from '../controllers/publicAuth.controller';
import { forgotPassword, resetPassword } from '../controllers/completeAuth.controller';
import { authenticateJwt } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/signup', publicSignup);
router.post('/register', publicSignup);
router.post('/login', loginRateLimiter, publicLogin);

// Browser GET /api/auth/login → redirect to frontend login page
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

router.get('/me', authenticateJwt, publicMe);
router.post('/logout', publicLogout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
