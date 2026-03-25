
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    storeName: { type: String, default: 'SaleSync Pro' },
    storeAddress: { type: String, default: '' },
    storePhone: { type: String, default: '' },
    storeEmail: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    invoicePrefix: { type: String, default: 'SS' },
    termsAndConditions: { type: String, default: 'Thank you for your business!' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
