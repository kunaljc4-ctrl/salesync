const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crm.controller');
const validate = require('../../../middleware/validation');
const { createCustomerDto, updateCustomerDto } = require('../dtos/crm.dto');

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         address:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/crm:
 *   get:
 *     summary: Retrieve a list of all customers
 *     tags: [CRM]
 *     responses:
 *       200:
 *         description: A list of customers
 *   post:
 *     summary: Create a new customer
 *     tags: [CRM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer created successfully
 */
router.get('/', crmController.getAllCustomers);
router.post('/', validate(createCustomerDto), crmController.createCustomer);

/**
 * @swagger
 * /api/crm/search:
 *   get:
 *     summary: Search customers by name or phone
 *     tags: [CRM]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching customers
 */
router.get('/search', crmController.searchCustomers);

/**
 * @swagger
 * /api/crm/{phone}:
 *   get:
 *     summary: Get a customer by phone number
 *     tags: [CRM]
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 *       404:
 *         description: Customer not found
 *   put:
 *     summary: Update a customer
 *     tags: [CRM]
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 */
router.get('/:phone', crmController.getCustomerByPhone);
router.put('/:phone', validate(updateCustomerDto), crmController.updateCustomer);

module.exports = router;
