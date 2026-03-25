const Joi = require('joi');

const createCustomerDto = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    altPhone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    address: Joi.string().allow('', null),
    tags: Joi.array().items(Joi.string()),
    notes: Joi.string().allow('', null)
});

const updateCustomerDto = Joi.object({
    name: Joi.string(),
    phone: Joi.string().length(10).pattern(/^[0-9]+$/),
    altPhone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    address: Joi.string().allow('', null),
    tags: Joi.array().items(Joi.string()),
    notes: Joi.string().allow('', null),
    totalSpend: Joi.number().min(0),
    visits: Joi.number().min(0),
    lastVisit: Joi.date()
});

module.exports = {
    createCustomerDto,
    updateCustomerDto
};
