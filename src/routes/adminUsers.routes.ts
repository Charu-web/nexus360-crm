import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  deleteUser,
} from '../controllers/adminUsers.controller';
import { authenticateJwt } from '../middleware/auth';
import { requireAdmin, requirePermission } from '../middleware/rbac';

const router = Router();

router.use(authenticateJwt, requireAdmin);

router.get('/', requirePermission('users'), getUsers);
router.post('/', requirePermission('users'), createUser);
router.get('/:id', requirePermission('users'), getUserById);
router.put('/:id', requirePermission('users'), updateUser);
router.patch('/:id/status', requirePermission('users'), toggleUserStatus);
router.post('/:id/reset-password', requirePermission('users'), resetUserPassword);
router.delete('/:id', requirePermission('users'), deleteUser);

export default router;
