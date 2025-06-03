import express from 'express';
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  searchClients,
  getClientStats,
  getRecentClients,
  exportClients
} from '../controllers/client.controller';
import { protect } from '../middleware/auth.middleware';
import { validateClientCreate, validateClientUpdate } from '../validators/client.validator';

const router = express.Router();

// Protéger toutes les routes
router.use(protect);

// Routes spéciales (doivent être avant les routes avec paramètres)
router.get('/search', searchClients);
router.get('/stats', getClientStats);
router.get('/recent', getRecentClients);
router.get('/export', exportClients);

// Routes CRUD
router.route('/')
  .get(getClients)
  .post(validateClientCreate, createClient);

router.route('/:id')
  .get(getClientById)
  .put(validateClientUpdate, updateClient)
  .delete(deleteClient);

export default router;
