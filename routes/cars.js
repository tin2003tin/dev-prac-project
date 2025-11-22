/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Car management & reviews
 */

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

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Get all cars
 *     tags: [Cars]
 */
router.route('/')
    .get(getCars)

/**
 * @swagger
 * /cars:
 *   post:
 *     summary: Add a new car (Admin only)
 *     tags: [Cars]
 *     security: [ { bearerAuth: [] } ]
 */
    .post(protect, authorize('admin'), createCar)


/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get car details
 *     tags: [Cars]
 */
router.route('/:id')
    .get(getCar)

/**
 * @swagger
 * /cars/{id}:
 *   put:
 *     summary: Update car (Admin only)
 *     tags: [Cars]
 *     security: [ { bearerAuth: [] } ]
 */
    .put(protect, authorize('admin'), updateCar)

/**
 * @swagger
 * /cars/{id}:
 *   delete:
 *     summary: Delete car (Admin only)
 *     tags: [Cars]
 *     security: [ { bearerAuth: [] } ]
 */
    .delete(protect, authorize('admin'), deleteCar)

/**
 * @swagger
 * /cars/{id}/reviews:
 *   get:
 *     summary: Get reviews for a car
 *     tags: [Cars]
 */
router.route('/:id/reviews')
    .get(getCarReviews)

/**
 * @swagger
 * /cars/{id}/reviews:
 *   post:
 *     summary: Add review for a car
 *     tags: [Cars]
 *     security: [ { bearerAuth: [] } ]
 */
    .post(protect, addCarReview)

module.exports = router
