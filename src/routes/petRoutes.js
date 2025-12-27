const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
} = require('../controllers/petController');

// All routes are protected with JWT authentication
router.get('/', authenticateToken, getAllPets);
router.get('/:id', authenticateToken, getPetById);
router.post('/', authenticateToken, createPet);
router.put('/:id', authenticateToken, updatePet);
router.delete('/:id', authenticateToken, deletePet);

module.exports = router;
