const mongoose = require('mongoose');
const Review = require('../models/Review')
const logError = require('../utils/logger');

exports.getReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.carId) {
            if (!mongoose.Types.ObjectId.isValid(req.query.carId)) {
                return res.status(400).json({ success: false, msg: 'Invalid car ID' });
            }
            filter.car = req.query.carId;
        }

        const total = await Review.countDocuments(filter);

        const reviews = await Review.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('user', 'name email') // include user info
            .populate('car', 'name model');

        res.status(200).json({
            success: true,
            msg: 'Get Reviews',
            data: reviews,
            pagination: {
                total,
                count: reviews.length,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logError(error, req, 'Get Reviews');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

exports.getReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid review ID' });
        }

        const review = await Review.findById(id)
            .populate('user', 'name email')
            .populate('car', 'name model');

        if (!review) {
            return res.status(404).json({ success: false, msg: 'Review not found' });
        }
        res.status(200).json({ success: true, msg: 'Get My Review', data: review });
    } catch (error) {
        logError(error, req, 'Get Review');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid review ID' });
        }

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ success: false, msg: 'Review not found' });
        }

        // Only allow update if user is admin or owns the review
        if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, msg: 'Access denied' });
        }

        // Perform update
        Object.assign(review, req.body);
        await review.save();
        await review.populate('user', 'name').populate('car', 'name model');

        res.status(200).json({ success: true, msg: 'Update My Review', data: review });
    } catch (error) {
        logError(error, req, 'Update Review');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid review ID' });
        }

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ success: false, msg: 'Review not found' });
        }

        // Only allow deletion if user is admin or owns the review
        if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, msg: 'Access denied' });
        }

        await review.deleteOne();
        await review.populate('user', 'name').populate('car', 'name model');

        res.status(200).json({ success: true, msg: 'Delete My Review', data: review });
    } catch (error) {
        logError(error, req, 'Delete Review');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};
