const salesService = require('../services/sales.service');

class SalesController {
    async createSale(req, res) {
        try {
            const sale = await salesService.createSale(req.body);
            res.status(201).json({ success: true, result: sale });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getAllSales(req, res) {
        try {
            const sales = await salesService.getAllSales();
            res.json({ success: true, results: sales });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getSaleByInvoiceId(req, res) {
        try {
            const sale = await salesService.getSaleByInvoiceId(req.params.invoiceId);
            if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
            res.json({ success: true, result: sale });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getSalesByCustomerPhone(req, res) {
        try {
            const sales = await salesService.getSalesByCustomerPhone(req.params.phone);
            res.json({ success: true, results: sales });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = new SalesController();
