import { Router } from 'express';
import { getSystemSettings, updateSystemSettings } from '../controllers/adminSettings.controller';
import { authenticateJwt } from '../middleware/auth';
import { requireAdmin, requirePermission } from '../middleware/rbac';

const router = Router();

router.use(authenticateJwt, requireAdmin);

router.get('/', requirePermission('settings'), getSystemSettings);
router.put('/', requirePermission('settings'), updateSystemSettings);

export default router;
