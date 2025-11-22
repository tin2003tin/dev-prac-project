/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

const express = require('express')
const {
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking
} = require('../controllers/bookings')

const router = express.Router()
const { protect, authorize } = require('../middleware/auth')

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings (Admin) or user's own bookings
 *     tags: [Bookings]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: List of bookings }
 */
router.route('/')
    .get(protect, getBookings) // controller checks role

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking (Registered user)
 *     tags: [Bookings]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       201: { description: Booking created }
 */
router.route('/')
    .post(protect, createBooking)

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID (Admin or owner)
 *     tags: [Bookings]
 *     security: [ { bearerAuth: [] } ]
 */
router.route('/:id')
    .get(protect, getBooking) // controller checks role and ownership
    .put(protect, updateBooking) // controller checks role and ownership
    .delete(protect, deleteBooking) // controller checks role and ownership

/**
 * @swagger
 * /bookings/{id}/status:
 *   put:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security: [ { bearerAuth: [] } ]
 */
router.route('/:id/status')
    .put(protect, updateBookingStatus) // controller checks role and allowed status

module.exports = router
