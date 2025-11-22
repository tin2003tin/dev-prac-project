const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 },
    brand: { type: String, required: true, maxlength: 50 },
    model: { type: String, required: true, maxlength: 50 },
    type: { type: String, enum: ['Sedan', 'SUV', 'Hatchback', 'Van', 'Truck', 'Convertible'], required: true },
    seats: { type: Number, required: true },
    fuel: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
    transmission: { type: String, enum: ['Manual', 'Automatic'], required: true },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

carSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

carSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model('Car', carSchema);
