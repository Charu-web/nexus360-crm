import { Router } from 'express';
import { getAdminReports } from '../controllers/adminReports.controller';
import { authenticateJwt } from '../middleware/auth';
import { requireAdmin, requirePermission } from '../middleware/rbac';

const router = Router();

router.get('/', authenticateJwt, requireAdmin, requirePermission('reports'), getAdminReports);

export default router;
