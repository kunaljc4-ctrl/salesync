const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');

// GET all sales
router.get('/', async (req, res) => {
    try {
        const sales = await Sale.find().sort({ createdAt: -1 });
        res.json({ success: true, results: sales });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST a new sale
router.post('/', async (req, res) => {
    const sale = new Sale(req.body);
    try {
        const newSale = await sale.save();
        res.status(201).json({ success: true, result: newSale });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// GET a specific sale by invoiceId
router.get('/:invoiceId', async (req, res) => {
    try {
        const sale = await Sale.findOne({ invoiceId: req.params.invoiceId });
        if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
        res.json({ success: true, result: sale });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
