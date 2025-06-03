import express from 'express';
import Showroom from '../models/Showroom';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/showrooms - Obtenir tous les showrooms
router.get('/', protect, async (req, res) => {
  try {
    const showrooms = await Showroom.find({ isActive: true });
    res.json({
      success: true,
      data: showrooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des showrooms'
    });
  }
});

// POST /api/showrooms - Créer un nouveau showroom
router.post('/', protect, async (req, res) => {
  try {
    const showroom = new Showroom(req.body);
    await showroom.save();
    res.status(201).json({
      success: true,
      data: showroom
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création du showroom'
    });
  }
});

// GET /api/showrooms/:id - Obtenir un showroom spécifique
router.get('/:id', protect, async (req, res) => {
  try {
    const showroom = await Showroom.findById(req.params.id);
    if (!showroom) {
      res.status(404).json({
        success: false,
        message: 'Showroom non trouvé'
      });
      return;
    }
    res.json({
      success: true,
      data: showroom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du showroom'
    });
  }
});

export default router;
