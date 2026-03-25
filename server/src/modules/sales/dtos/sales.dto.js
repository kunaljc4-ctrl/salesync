const Joi = require('joi');

const productSchema = Joi.object({
    category: Joi.string().required(),
    brand: Joi.string().required(),
    model: Joi.string().required(),
    serial: Joi.string().allow('', null),
    color: Joi.string().allow('', null),
    batchNo: Joi.string().allow('', null),
    specs: Joi.object().unknown(true),
    sellingPrice: Joi.number().positive().required(),
    itemDiscount: Joi.number().min(0).default(0),
    taxRate: Joi.number().min(0).default(18),
    taxAmount: Joi.number().min(0),
    purchaseCost: Joi.number().min(0)
});

const createSaleDto = Joi.object({
    invoiceId: Joi.string().required(),
    customerName: Joi.string().required(),
    customerPhone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    altPhone: Joi.string().allow('', null),
    customerEmail: Joi.string().email().allow('', null),
    customerAddress: Joi.string().allow('', null),
    purchaseDate: Joi.date().default(Date.now),
    products: Joi.array().items(productSchema).min(1).required(),
    subtotal: Joi.number().min(0).required(),
    discount: Joi.number().min(0).default(0),
    grandTotal: Joi.number().min(0).required(),
    paymentMode: Joi.string().required(),
    paymentStatus: Joi.string().valid('Paid', 'Unpaid', 'Partial').required(),
    advance: Joi.number().min(0).default(0),
    balance: Joi.number().min(0).default(0),
    warrantyStart: Joi.date(),
    warrantyEnd: Joi.date(),
    remarks: Joi.string().allow('', null),
    emiDetails: Joi.object({
        tenure: Joi.number().min(1),
        interest: Joi.number().min(0),
        processingFee: Joi.number().min(0),
        monthlyEmi: Joi.number().min(0)
    }).optional()
});

module.exports = {
    createSaleDto
};
