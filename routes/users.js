/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and preferences
 */

const express = require('express')
const {
    getMe,
    getFavoriteCarSpecs,
    setFavoriteCarSpecs
} = require('../controllers/users')

const { protect } = require('../middleware/auth')

const router = express.Router()

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: User profile }
 */
router.route('/me').get(protect, getMe)

/**
 * @swagger
 * /users/favorite-car:
 *   get:
 *     summary: Get user's favorite car specifications
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: Favorite car preferences }
 *
 *   put:
 *     summary: Set or update favorite car specifications
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string }
 *               brand: { type: string }
 *               fuel: { type: string }
 *               transmission: { type: string }
 *               seats: { type: number }
 *     responses:
 *       200: { description: Updated specs }
 */
router
    .route('/favorite-car')
    .get(protect, getFavoriteCarSpecs)
    .put(protect, setFavoriteCarSpecs)

module.exports = router
