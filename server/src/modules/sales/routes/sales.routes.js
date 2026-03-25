const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const validate = require('../../../middleware/validation');
const { createSaleDto } = require('../dtos/sales.dto');

/**
 * @swagger
 * components:
 *   schemas:
 *     Sale:
 *       type: object
 *       required:
 *         - invoiceId
 *         - customerName
 *         - customerPhone
 *         - products
 *         - grandTotal
 *         - paymentMode
 *         - paymentStatus
 *       properties:
 *         invoiceId:
 *           type: string
 *         customerName:
 *           type: string
 *         customerPhone:
 *           type: string
 *         products:
 *           type: array
 *           items:
 *             type: object
 *         grandTotal:
 *           type: number
 *         paymentMode:
 *           type: string
 *         paymentStatus:
 *           type: string
 */

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Retrieve a list of all sales
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: A list of sales
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sale'
 *     responses:
 *       201:
 *         description: Sale created successfully
 *       400:
 *         description: Validation error
 */

router.get('/', salesController.getAllSales);
router.post('/', validate(createSaleDto), salesController.createSale);

/**
 * @swagger
 * /api/sales/{invoiceId}:
 *   get:
 *     summary: Get a sale by invoice ID
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale details
 *       404:
 *         description: Sale not found
 */
router.get('/:invoiceId', salesController.getSaleByInvoiceId);

/**
 * @swagger
 * /api/sales/customer/{phone}:
 *   get:
 *     summary: Get all sales for a specific customer phone
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customer sales
 */
router.get('/customer/:phone', salesController.getSalesByCustomerPhone);

module.exports = router;
