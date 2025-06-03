import express from 'express';
import path from 'path';
import { getProfile, updateProfile, updatePassword } from '../controllers/profile.controller';
import { protect } from '../middleware/auth.middleware';
import { uploadImage } from '../middleware/upload.middleware';
import { validateProfileUpdate, validatePasswordUpdate } from '../validators/profile.validator';

const router = express.Router();

// Routes pour le profil
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadImage.middleware, validateProfileUpdate, updateProfile);
router.put('/profile/password', protect, validatePasswordUpdate, updatePassword);
router.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(__dirname, '../uploads', filename));
});

export default router;
