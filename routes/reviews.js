const express = require('express')
const {
    getReviews,
    getReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews')

const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.route('/')
    .get(getReviews)

router.route('/:id')
    .get(getReview)
    .put(protect, updateReview)
    .delete(protect, deleteReview)

module.exports = router
