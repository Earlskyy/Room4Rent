const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const {
  getTenantBills,
  getCurrentBill,
  getAllBills,
  generateBill,
  updateBillStatus,
  recordPayment,
  getPaymentHistory,
} = require('../controllers/billController');

const router = express.Router();

router.get('/tenant/:tenant_id', authMiddleware, getTenantBills);
router.get('/tenant/:tenant_id/current', authMiddleware, getCurrentBill);
router.get('/', authMiddleware, adminOnly, getAllBills);
router.post('/generate', authMiddleware, adminOnly, generateBill);
router.put('/:id/status', authMiddleware, adminOnly, updateBillStatus);
router.post('/payment', authMiddleware, adminOnly, recordPayment);
router.get('/payment/:bill_id', authMiddleware, getPaymentHistory);

module.exports = router;
