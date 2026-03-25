
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get store settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 */
router.get('/', settingsController.getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update store settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
router.put('/', settingsController.updateSettings);

module.exports = router;
