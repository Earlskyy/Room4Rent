const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats,
  getIncomeReport,
  getUnpaidBillsReport,
  getUtilityUsageReport,
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/stats', authMiddleware, adminOnly, getDashboardStats);
router.get('/income-report', authMiddleware, adminOnly, getIncomeReport);
router.get('/unpaid-bills', authMiddleware, adminOnly, getUnpaidBillsReport);
router.get('/utility-usage', authMiddleware, adminOnly, getUtilityUsageReport);

module.exports = router;
