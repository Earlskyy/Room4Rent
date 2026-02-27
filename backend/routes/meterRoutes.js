const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const {
  getMeterReadings,
  createMeterReading,
} = require('../controllers/meterController');

const router = express.Router();

router.get('/:room_id', getMeterReadings);
router.post('/', authMiddleware, adminOnly, createMeterReading);

module.exports = router;
