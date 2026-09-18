import { Router } from 'express';
import { getAdminDashboardMetrics } from '../controllers/adminDashboard.controller';
import { authenticateJwt } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', authenticateJwt, requireAdmin, getAdminDashboardMetrics);

export default router;
