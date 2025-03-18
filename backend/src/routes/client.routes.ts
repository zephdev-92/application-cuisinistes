import express, { RequestHandler } from 'express';
import { createClient, getClients, getClientById, updateClient, deleteClient, searchClients } from '../controllers/client.controller';
import { protect } from '../middleware/auth.middleware';
import { validateClientCreate, validateClientUpdate } from '../validators/client.validator';

const router = express.Router();

// Protéger toutes les routes
router.use(protect);

// Route de recherche (doit être placée avant la route /:id)
router.get('/search', searchClients);

// Routes CRUD
router.route('/')
  .get(getClients)
  .post(validateClientCreate as RequestHandler[], createClient);

router.route('/:id')
  .get(getClientById)
  .put(validateClientUpdate as RequestHandler[], updateClient)
  .delete(deleteClient);

export default router;
