const express = require('express');
const router = express.Router();
const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  createCarReview
} = require('../controllers/carController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { validate, carValidationRules, carUpdateValidationRules } = require('../middlewares/validationMiddleware');

router.route('/')
  .get(getCars)
  .post(protect, admin, upload.single('image'), carValidationRules(), validate, createCar);

router.route('/:id')
  .get(getCarById)
  .put(protect, admin, upload.single('image'), carUpdateValidationRules(), validate, updateCar)
  .delete(protect, admin, deleteCar);

router.route('/:id/reviews').post(protect, createCarReview);

module.exports = router;
