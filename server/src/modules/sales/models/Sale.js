
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    category: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    serial: { type: String },
    color: { type: String },
    batchNo: { type: String },
    specs: { type: Map, of: String },
    sellingPrice: { type: Number, required: true },
    itemDiscount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 },
    taxAmount: { type: Number },
    purchaseCost: { type: Number }
});

const saleSchema = new mongoose.Schema({
    invoiceId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    altPhone: { type: String },
    customerEmail: { type: String },
    customerAddress: { type: String },
    purchaseDate: { type: Date, default: Date.now },
    products: [productSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMode: { type: String, required: true },
    paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Partial'], required: true },
    advance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    warrantyStart: { type: Date },
    warrantyEnd: { type: Date },
    remarks: { type: String },
    emiDetails: {
        tenure: { type: Number },
        interest: { type: Number },
        processingFee: { type: Number },
        monthlyEmi: { type: Number }
    }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
