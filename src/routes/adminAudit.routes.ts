import { Router } from 'express';
import { getAuditLogs } from '../controllers/adminAudit.controller';
import { authenticateJwt } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', authenticateJwt, requireAdmin, getAuditLogs);

export default router;
