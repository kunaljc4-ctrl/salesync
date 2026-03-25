const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const validate = require('../../../middleware/validation');
const { createInventoryDto, updateInventoryDto } = require('../dtos/inventory.dto');

/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryItem:
 *       type: object
 *       required:
 *         - brand
 *         - model
 *         - category
 *         - price
 *         - cost
 *       properties:
 *         brand:
 *           type: string
 *         model:
 *           type: string
 *         category:
 *           type: string
 *         price:
 *           type: number
 *         cost:
 *           type: number
 *         stock:
 *           type: integer
 *         specs:
 *           type: object
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Retrieve all inventory items
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: A list of items
 *   post:
 *     summary: Add a new item to inventory
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryItem'
 *     responses:
 *       201:
 *         description: Item created successfully
 */
router.get('/', inventoryController.getAllInventory);
router.post('/', validate(createInventoryDto), inventoryController.createItem);

/**
 * @swagger
 * /api/inventory/search:
 *   get:
 *     summary: Search inventory by brand, model, or category
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching items
 */
router.get('/search', inventoryController.searchInventory);

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get an item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item details
 *       404:
 *         description: Item not found
 *   put:
 *     summary: Update an item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryItem'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *   delete:
 *     summary: Delete an item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted successfully
 */
router.get('/:id', inventoryController.getItemById);
router.put('/:id', validate(updateInventoryDto), inventoryController.updateItem);
router.delete('/:id', inventoryController.deleteItem);

module.exports = router;
