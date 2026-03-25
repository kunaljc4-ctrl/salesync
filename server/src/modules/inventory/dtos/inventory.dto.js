const Joi = require('joi');

const createInventoryDto = Joi.object({
    brand: Joi.string().required(),
    model: Joi.string().required(),
    category: Joi.string().required(),
    price: Joi.number().min(0).required(),
    cost: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).default(0),
    specs: Joi.object().unknown(true)
});

const updateInventoryDto = Joi.object({
    brand: Joi.string(),
    model: Joi.string(),
    category: Joi.string(),
    price: Joi.number().min(0),
    cost: Joi.number().min(0),
    stock: Joi.number().integer().min(0),
    specs: Joi.object().unknown(true)
});

module.exports = {
    createInventoryDto,
    updateInventoryDto
};
