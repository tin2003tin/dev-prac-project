const User = require('../models/User')
const logError = require('../utils/logger');

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        res.status(200).json({
            success: true, data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                tel: user.tel,
                role: user.role,
                favoriteCarSpecs: user.favoriteCarSpecs || {},
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        })
    } catch (err) {
        logError(err, req, 'Get Me');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}

exports.getFavoriteCarSpecs = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('favoriteCarSpecs');

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user.favoriteCarSpecs || {}
        });
    } catch (err) {
        logError(err, req, 'Get Favorite Car Specs');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};

exports.setFavoriteCarSpecs = async (req, res) => {
    try {
        const { type, brand, fuel, transmission, seats } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                favoriteCarSpecs: { type, brand, fuel, transmission, seats }
            },
            { new: true } 
        );

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                favoriteCarSpecs: user.favoriteCarSpecs
            }
        });

    } catch (err) {
        logError(err, req, 'Set Favorite Car Specs');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};