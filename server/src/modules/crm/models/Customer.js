
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    altPhone: { type: String },
    email: { type: String },
    address: { type: String },
    tags: [{ type: String }],
    totalVisits: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    lastVisit: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
