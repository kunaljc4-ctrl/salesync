
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    category: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    cost: { type: Number, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    specs: { type: Map, of: String },
    lastStocked: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique combination of category, brand and model
inventorySchema.index({ category: 1, brand: 1, model: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
