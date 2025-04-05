// backend/src/routes/provider.routes.ts
import { Router } from 'express';
import {
  getAllProviders,
  searchProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider
} from '../controllers/provider.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validateProviderUpdate } from '../validators/provider.validator';
import { UserRole } from '../models/User';

const router = Router();

// Routes prestataires avec middleware d'authentification
router.get('/', protect, getAllProviders);
router.get('/search', protect, searchProviders);
router.get('/:id', protect, getProviderById);
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.CUISINISTE), createProvider);
router.put('/:id', protect, authorize(UserRole.ADMIN, UserRole.CUISINISTE), validateProviderUpdate, updateProvider);
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteProvider);

export default router;

