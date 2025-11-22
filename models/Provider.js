const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 },
    address: { type: String, required: true, maxlength: 200 },
    tel: { type: String, required: true, maxlength: 20 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

providerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

providerSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model('Provider', providerSchema);
