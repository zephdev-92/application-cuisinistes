import express from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRegister, validateLogin } from '../validators/auth.validator';

const router = express.Router();

// Routes d'authentification
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
