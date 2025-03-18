import express, { RequestHandler } from 'express';
import path from 'path';
import { getProfile, updateProfile, updatePassword } from '../controllers/profile.controller';
import { protect } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';
import { validateProfileUpdate, validatePasswordUpdate } from '../validators/profile.validator';

const router = express.Router();

// Routes pour le profil
router.get('/', protect, getProfile);
router.put('/', protect, upload.single('companyLogo'), validateProfileUpdate as RequestHandler[], updateProfile);
router.put('/password', protect, validatePasswordUpdate as RequestHandler[], updatePassword);
router.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(__dirname, '../uploads', filename));
});

export default router;
