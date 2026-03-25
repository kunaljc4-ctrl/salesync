const inventoryService = require('../services/inventory.service');

class InventoryController {
    async createItem(req, res) {
        try {
            const item = await inventoryService.createItem(req.body);
            res.status(201).json({ success: true, result: item });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getAllInventory(req, res) {
        try {
            const items = await inventoryService.getAllInventory();
            res.json({ success: true, results: items });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getItemById(req, res) {
        try {
            const item = await inventoryService.getItemById(req.params.id);
            if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
            res.json({ success: true, result: item });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async updateItem(req, res) {
        try {
            const item = await inventoryService.updateItem(req.params.id, req.body);
            if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
            res.json({ success: true, result: item });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async deleteItem(req, res) {
        try {
            await inventoryService.deleteItem(req.params.id);
            res.json({ success: true, message: 'Item deleted successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async searchInventory(req, res) {
        try {
            const items = await inventoryService.searchInventory(req.query.q);
            res.json({ success: true, results: items });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = new InventoryController();
