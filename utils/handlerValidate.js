const handleValidationError = (error, res) => {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ success: false, msg: 'Invalid request', errors: messages });
    }
    return false;
};

module.exports = handleValidationError;
