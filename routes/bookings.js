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

router.route('/')
    .get(protect, getBookings)
    .post(protect, authorize('admin'), createBooking) 

router.route('/:id')
    .get(protect, getBooking)
    .put(protect, authorize('admin'), updateBooking) 
    .delete(protect, authorize('admin'), deleteBooking)

router.route('/:id/status')
    .put(protect, updateBookingStatus)

module.exports = router
