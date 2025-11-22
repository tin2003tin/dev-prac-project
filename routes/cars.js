const express = require('express')
const {
    getCars,
    getCar,
    createCar,
    updateCar,
    deleteCar,
    getCarReviews,
    addCarReview
} = require('../controllers/cars')

const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.route('/')
    .get(getCars)
    .post(protect, authorize('admin'), createCar)

router.route('/:id')
    .get(getCar)
    .put(protect, authorize('admin'), updateCar)
    .delete(protect, authorize('admin'), deleteCar)

router.route('/:id/reviews')
    .get(getCarReviews)
    .post(protect, addCarReview)

module.exports = router
