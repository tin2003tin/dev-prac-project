const Provider = require('../models/Provider')

exports.getProviders = async (req, res) => {
    try {
        const providers = await Provider.find();
        res.status(200).json({
            success: true,
            count: providers.length,
            data: providers
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};