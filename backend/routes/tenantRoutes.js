const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const {
  getTenants,
  getTenantById,
  getTenantByUserId,
  createTenant,
  updateTenant,
  removeTenant,
} = require('../controllers/tenantController');

const router = express.Router();

router.get('/', authMiddleware, adminOnly, getTenants);
router.get('/:id', authMiddleware, getTenantById);
router.get('/user/:userId', authMiddleware, getTenantByUserId);
router.post('/', authMiddleware, adminOnly, createTenant);
router.put('/:id', authMiddleware, adminOnly, updateTenant);
router.delete('/:id', authMiddleware, adminOnly, removeTenant);

module.exports = router;
