const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { validate, bookingValidationRules, updateBookingStatusValidationRules } = require('../middlewares/validationMiddleware');


router.route('/')
  .post(protect, bookingValidationRules(), validate, createBooking);

router.get('/admin', protect, admin, getAllBookings);
router.get('/my', protect, getMyBookings);

router.route('/:id')
  .put(protect, updateBookingStatusValidationRules(), validate, updateBookingStatus)
  .delete(protect, admin, deleteBooking);

module.exports = router;
