const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 },
    brand: { type: String, required: true, maxlength: 50 },
    model: { type: String, required: true, maxlength: 50 },
    year: { type: Number, required: true },
    type: { type: String, enum: ['Sedan', 'SUV', 'Hatchback', 'Van', 'Truck', 'Convertible'], required: true },
    seats: { type: Number, required: true },
    fuel: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
    transmission: { type: String, enum: ['Manual', 'Automatic'], required: true },
    pricePerDay: { type: Number, required: true },
    description: { type: String, maxlength: 500 },
    images: [{ type: String, maxlength: 200, required: true }],
    location: {
        address: { type: String, maxlength: 200 },
        city: { type: String, maxlength: 100 },
        state: { type: String, maxlength: 100 },
        zipCode: { type: String, maxlength: 20 },
        coordinates: {
            type: { type: String, default: 'Point' },
            coordinates: [Number] // [longitude, latitude]
        }
    },
    available: { type: Boolean, default: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

carSchema.index({ 'location.coordinates': '2dsphere' });

carSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

carSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model('Car', carSchema);

