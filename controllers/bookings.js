const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const logError = require('../utils/logger');
const handleValidationError = require('../utils/handlerValidate');

exports.getBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Booking.countDocuments();

        const bookings = await Booking.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('user', 'name tel email')
            .populate('car', 'name brand model pricePerDay');

        res.status(200).json({
            success: true,
            msg: 'Get All Bookings',
            data: bookings,
            pagination: {
                total,
                count: bookings.length,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        logError(err, req, 'Get Bookings');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

exports.getBooking = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const bookings = await Booking.find()
                .populate('user', 'name tel email')
                .populate('car', 'name brand model pricePerDay');

            return res.status(200).json({
                success: true,
                msg: 'All Bookings',
                data: bookings
            });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid booking ID' });
        }

        const booking = await Booking.findById(id)
            .populate('user', 'name tel email')
            .populate('car', 'name brand model pricePerDay');

        if (!booking) {
            return res.status(404).json({ success: false, msg: 'Booking not found' });
        }

        if (booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, msg: 'Access denied' });
        }

        res.status(200).json({ success: true, msg: 'Get Booking', data: booking });
    } catch (err) {
        logError(err, req, 'Get Booking');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const { car_id, startDate, endDate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(car_id)) {
            return res.status(400).json({ success: false, msg: 'Invalid car ID' });
        }

        const car = await Car.findById(car_id);
        if (!car) {
            return res.status(404).json({ success: false, msg: 'Car not found' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            return res.status(400).json({ success: false, msg: 'End date must be after start date' });
        }

        const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalPrice = car.pricePerDay * dayCount;

        const booking = await Booking.create({
            user: req.user._id,
            car: car._id,
            startDate: start,
            endDate: end,
            totalPrice,
            status: 'Pending'
        });

        res.status(201).json({
            success: true,
            msg: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        if (!handleValidationError(error, res)) {
            logError(error, req, 'Create Booking');
            res.status(500).json({ success: false, msg: 'Internal server error' });
        }
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid booking ID' });
        }

        const booking = await Booking.findByIdAndUpdate(id, req.body, { new: true })
            .populate('user', 'name tel email')
            .populate('car', 'name brand model pricePerDay');

        if (!booking) {
            return res.status(404).json({ success: false, msg: 'Booking not found' });
        }

        res.status(200).json({ success: true, msg: 'Booking updated', data: booking });
    } catch (err) {
        logError(err, req, 'Update Booking');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid booking ID' });
        }

        const allowedStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, msg: 'Invalid status value' });
        }

        const booking = await Booking.findById(id)
            .populate('user', 'name tel email')
            .populate('car', 'name brand model pricePerDay');

        if (!booking) {
            return res.status(404).json({ success: false, msg: 'Booking not found' });
        }

        // Role-based restrictions
        if (req.user.role !== 'admin') {
            if (status === 'Confirmed' || status === 'Completed') {
                return res.status(403).json({ success: false, msg: 'Only admin can set this status' });
            }
            if (booking.user._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, msg: 'Access denied' });
            }
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({
            success: true,
            msg: `Booking status updated to ${status}`,
            data: booking
        });

    } catch (err) {
        logError(err, req, 'Update Booking Status');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};


exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid booking ID' });
        }

        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
            return res.status(404).json({ success: false, msg: 'Booking not found' });
        }

        res.status(200).json({ success: true, msg: 'Booking deleted', data: booking });
    } catch (err) {
        logError(err, req, 'Delete Booking');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};
