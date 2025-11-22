const mongoose = require('mongoose');
const Car = require('../models/Car')
const Review = require('../models/Review')
const Booking = require('../models/Booking')
const handleValidationError = require('../utils/handlerValidate')
const logError = require('../utils/logger');

exports.getCars = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};

        // --- Search keywords ---
        if (req.query.search) {
            const keywords = req.query.search.split(' ').filter(k => k.trim() !== '');
            query.$and = keywords.map(keyword => ({
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { brand: { $regex: keyword, $options: 'i' } },
                    { model: { $regex: keyword, $options: 'i' } },
                    { type: { $regex: keyword, $options: 'i' } },
                    { fuel: { $regex: keyword, $options: 'i' } },
                    { transmission: { $regex: keyword, $options: 'i' } },
                    { seats: isNaN(keyword) ? undefined : parseInt(keyword) }
                ].filter(Boolean)
            }));
        }

        // --- Optional Filters ---
        if (req.query.type) query.type = req.query.type;
        if (req.query.brand) query.brand = req.query.brand;
        if (req.query.fuel) query.fuel = req.query.fuel;
        if (req.query.transmission) query.transmission = req.query.transmission;
        if (req.query.seats) query.seats = parseInt(req.query.seats);

        // --- Count and Paginate ---
        const total = await Car.countDocuments(query);
        const cars = await Car.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('provider_ids', 'name email phone address'); // <-- populate provider info

        res.status(200).json({
            success: true,
            msg: 'Get All Cars',
            data: cars,
            pagination: {
                total,
                count: cars.length,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        logError(error, req, 'Get Cars');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

exports.getCar = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid car ID' });
        }

        const car = await Car.findById(id)
            .populate('provider_ids', 'name email phone address'); // <-- populate provider info

        if (!car) {
            return res.status(404).json({ success: false, msg: 'Car not found' });
        }

        res.status(200).json({ success: true, msg: 'Get My Car', data: car });
    } catch (error) {
        logError(error, req, 'Get Car');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

exports.createCar = async (req, res) => {
    try {
        const car = await Car.create(req.body);
        res.status(201).json({ success: true, msg: 'Create My Car', data: car });
    } catch (error) {
        if (!handleValidationError(error, res)) {
            logError(error, req, 'Create Car');
            res.status(500).json({ success: false, msg: 'Internal server error' });
        }
    }
};

exports.updateCar = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid car ID' });
        }

        const car = await Car.findByIdAndUpdate(id, req.body, { new: true });
        if (!car) {
            return res.status(404).json({ success: false, msg: 'Car not found' });
        }
        res.status(200).json({ success: true, msg: 'Update My Car', data: car });
    } catch (error) {
        logError(error, req, 'Update Car');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}

exports.deleteCar = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid car ID' });
        }

        const car = await Car.findByIdAndDelete(id);
        if (!car) {
            return res.status(404).json({ success: false, msg: 'Car not found' });
        }
        res.status(200).json({ success: true, msg: 'Delete My Car', data: car });
    } catch (error) {
        logError(error, req, 'Delete Car');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

exports.getCarReviews = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid car ID' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const car = await Car.findById(id).populate({
            path: 'reviews',
            options: { skip, limit, sort: { createdAt: -1 } },
            populate: { path: 'user', select: 'name email' } // get user name and email
        });

        if (!car) {
            return res.status(404).json({ success: false, msg: 'Car not found' });
        }

        const totalReviews = await mongoose.model('Review').countDocuments({ car: id });

        res.status(200).json({
            success: true,
            msg: 'Get Car Reviews',
            data: car.reviews,
            pagination: {
                total: totalReviews,
                count: car.reviews.length,
                page,
                limit,
                totalPages: Math.ceil(totalReviews / limit)
            }
        });
    } catch (error) {
        logError(error, req, 'Get Car Reviews');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

exports.addCarReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: 'Invalid car ID' });
        }

        const car = await Car.findById(id);
        if (!car) {
            return res.status(404).json({ success: false, msg: 'Car not found' });
        }

        // Check if the user has a booking for this car with allowed status
        const booking = await Booking.findOne({
            car: car._id,
            user: req.user._id,
            status: { $in: ['Confirmed', 'Completed', 'Cancelled'] }
        });

        if (!booking) {
            return res.status(403).json({ 
                success: false, 
                msg: 'You can only review cars you have booked with status Confirmed, Completed, or Cancelled' 
            });
        }

        let review = await Review.create({ ...req.body, car: car._id, user: req.user._id });
        car.reviews.push(review._id);
        await car.save();

        review = await Review.findById(review._id).populate('user', 'name');

        res.status(200).json({ success: true, msg: 'Add Car Review', data: review });
    } catch (error) {
        if (!handleValidationError(error, res)) {
            logError(error, req, 'Add Car Review');
            res.status(500).json({ success: false, msg: 'Internal server error' });
        }
    }
};


