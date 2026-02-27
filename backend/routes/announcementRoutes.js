const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');

const router = express.Router();

router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', authMiddleware, adminOnly, createAnnouncement);
router.put('/:id', authMiddleware, adminOnly, updateAnnouncement);
router.delete('/:id', authMiddleware, adminOnly, deleteAnnouncement);

module.exports = router;
