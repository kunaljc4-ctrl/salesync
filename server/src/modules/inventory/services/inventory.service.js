const Inventory = require('../models/Inventory');

class InventoryService {
    async createItem(itemData) {
        const item = new Inventory(itemData);
        return await item.save();
    }

    async getAllInventory() {
        return await Inventory.find().sort({ updatedAt: -1 });
    }

    async getItemById(id) {
        return await Inventory.findById(id);
    }

    async updateItem(id, updateData) {
        return await Inventory.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteItem(id) {
        return await Inventory.findByIdAndDelete(id);
    }

    async searchInventory(query) {
        const regex = new RegExp(query, 'i');
        return await Inventory.find({
            $or: [{ brand: regex }, { model: regex }, { category: regex }]
        });
    }

    async updateStock(brand, model, quantity) {
        return await Inventory.findOneAndUpdate(
            { brand, model },
            { $inc: { stock: quantity } },
            { new: true }
        );
    }

    async decrementStock(brand, model, quantity) {
        return await Inventory.findOneAndUpdate(
            { brand, model, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        );
    }
}

module.exports = new InventoryService();
