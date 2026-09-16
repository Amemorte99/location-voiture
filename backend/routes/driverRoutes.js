const express = require('express');
const router = express.Router();
const {
  getDrivers,
  createDriver,
  updateDriver,
  updateDriverStatus,
  deleteDriver,
  assignDriverToBooking,
} = require('../controllers/driverController');
const { protect, admin } = require('../middlewares/authMiddleware');

// All driver management routes are protected and restricted to admin
router.use(protect, admin);

router.route('/')
  .get(getDrivers)
  .post(createDriver);

router.post('/assign', assignDriverToBooking);

router.patch('/:id/status', updateDriverStatus);

router.route('/:id')
  .put(updateDriver)
  .delete(deleteDriver);

module.exports = router;
