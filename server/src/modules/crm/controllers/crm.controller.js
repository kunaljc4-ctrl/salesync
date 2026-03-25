const crmService = require('../services/crm.service');

class CrmController {
    async createCustomer(req, res) {
        try {
            const customer = await crmService.createCustomer(req.body);
            res.status(201).json({ success: true, result: customer });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getAllCustomers(req, res) {
        try {
            const customers = await crmService.getAllCustomers();
            res.json({ success: true, results: customers });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getCustomerByPhone(req, res) {
        try {
            const customer = await crmService.getCustomerByPhone(req.params.phone);
            if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
            res.json({ success: true, result: customer });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async updateCustomer(req, res) {
        try {
            const customer = await crmService.updateCustomer(req.params.phone, req.body);
            if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
            res.json({ success: true, result: customer });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async searchCustomers(req, res) {
        try {
            const customers = await crmService.searchCustomers(req.query.q);
            res.json({ success: true, results: customers });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = new CrmController();
