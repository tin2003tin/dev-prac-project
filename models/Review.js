const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true }, 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    rating: { type: Number, required: true, min: 1, max: 5 }, 
    comment: { type: String, maxlength: 1000 }, 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

reviewSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Review', reviewSchema);
