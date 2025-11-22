const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const logError = require('../utils/logger');

/**
 * Get bookings
 * - Admin: get all bookings
 * - User: get own bookings
 */
exports.getBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.user.role !== 'admin') {
            query.user = req.user._id;
        }

        const total = await Booking.countDocuments(query);
        const bookings = await Booking.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('user', 'name tel email')
            .populate('car', 'name brand model pricePerDay');

        res.status(200).json({
            success: true,
            msg: req.user.role === 'admin' ? 'All bookings' : 'Your bookings',
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

/**
 * Get single booking by ID
 * - Admin: any booking
 * - User: only own booking
 */
exports.getBooking = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, msg: 'Invalid booking ID' });

        const booking = await Booking.findById(id)
            .populate('user', 'name tel email')
            .populate('car', 'name brand model pricePerDay');

        if (!booking) return res.status(404).json({ success: false, msg: 'Booking not found' });

        if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, msg: 'Access denied' });
        }

        res.status(200).json({ success: true, msg: 'Booking retrieved', data: booking });
    } catch (err) {
        logError(err, req, 'Get Booking');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

/**
 * Create a booking
 * - User: max 3 active bookings
 */
exports.createBooking = async (req, res) => {
    try {
        const { car_id, provider, startDate, endDate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(car_id))
            return res.status(400).json({ success: false, msg: 'Invalid car ID' });
        if (!provider) return res.status(400).json({ success: false, msg: 'Provider is required' });

        const car = await Car.findById(car_id);
        if (!car) return res.status(404).json({ success: false, msg: 'Car not found' });

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start)
            return res.status(400).json({ success: false, msg: 'End date must be after start date' });

        // Check max 3 active bookings for user
        const activeBookings = await Booking.countDocuments({
            user: req.user._id,
            status: { $in: ['Pending', 'Confirmed'] }
        });
        if (activeBookings >= 3)
            return res.status(403).json({ success: false, msg: 'Maximum 3 active bookings allowed' });

        const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalPrice = car.pricePerDay * dayCount;

        const booking = await Booking.create({
            user: req.user._id,
            car: car._id,
            provider,
            startDate: start,
            endDate: end,
            totalPrice,
            status: 'Pending'
        });

        res.status(201).json({ success: true, msg: 'Booking created', data: booking });
    } catch (err) {
        logError(err, req, 'Create Booking');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

/**
 * Update booking
 * - Admin: any booking
 * - User: only own booking
 */
exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, msg: 'Invalid booking ID' });

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ success: false, msg: 'Booking not found' });

        if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, msg: 'Access denied' });
        }

        Object.assign(booking, req.body); // update fields
        await booking.save();

        const updatedBooking = await Booking.findById(id)
            .populate('user', 'name tel email')
            .populate('car', 'name brand model pricePerDay');

        res.status(200).json({ success: true, msg: 'Booking updated', data: updatedBooking });
    } catch (err) {
        logError(err, req, 'Update Booking');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

/**
 * Update booking status
 * - Admin: any status
 * - User: only cancel own bookings
 */
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, msg: 'Invalid booking ID' });

        const allowedStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
        if (!allowedStatuses.includes(status))
            return res.status(400).json({ success: false, msg: 'Invalid status value' });

        const booking = await Booking.findById(id)
            .populate('user', 'name tel email')
            .populate('car', 'name brand model pricePerDay');

        if (!booking) return res.status(404).json({ success: false, msg: 'Booking not found' });

        // Role-based rules
        if (req.user.role !== 'admin') {
            if (!['Pending', 'Cancelled'].includes(status))
                return res.status(403).json({ success: false, msg: 'Only admin can set this status' });
            if (booking.user._id.toString() !== req.user._id.toString())
                return res.status(403).json({ success: false, msg: 'Access denied' });
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({ success: true, msg: `Booking status updated to ${status}`, data: booking });
    } catch (err) {
        logError(err, req, 'Update Booking Status');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

/**
 * Delete booking
 * - Admin: any booking
 * - User: only own booking
 */
exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, msg: 'Invalid booking ID' });

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ success: false, msg: 'Booking not found' });

        if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, msg: 'Access denied' });
        }

        await booking.remove();
        res.status(200).json({ success: true, msg: 'Booking deleted', data: booking });
    } catch (err) {
        logError(err, req, 'Delete Booking');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};
