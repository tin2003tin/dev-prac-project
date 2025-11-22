
const express = require('express')
const {
    getMe,
    getFavoriteCarSpecs,
    setFavoriteCarSpecs
} = require('../controllers/users')

const { protect } = require('../middleware/auth')

const router = express.Router()

router.route('/me').get(protect, getMe)
router.route('/favorite-car').get(protect,getFavoriteCarSpecs).put(protect, setFavoriteCarSpecs);

module.exports = router 