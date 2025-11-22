/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management
 */

const express = require('express')
const {
    getReviews,
    getReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews')

const { protect } = require('../middleware/auth')
const router = express.Router()

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews (paginated)
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: carId
 *         schema:
 *           type: string
 *         description: Filter by car ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200: { description: List of reviews }
 */
router.route('/')
    .get(getReviews)

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200: { description: Review found }
 *       404: { description: Review not found }
 *
 *   put:
 *     summary: Update a review (owner or admin)
 *     tags: [Reviews]
 *     security: [ { bearerAuth: [] } ]
 *
 *   delete:
 *     summary: Delete a review (owner or admin)
 *     tags: [Reviews]
 *     security: [ { bearerAuth: [] } ]
 */
router.route('/:id')
    .get(getReview)
    .put(protect, updateReview)
    .delete(protect, deleteReview)

module.exports = router
