const Customer = require('../models/Customer');

class CrmService {
    async createCustomer(customerData) {
        const customer = new Customer(customerData);
        return await customer.save();
    }

    async getAllCustomers() {
        return await Customer.find().sort({ updatedAt: -1 });
    }

    async getCustomerByPhone(phone) {
        return await Customer.findOne({ phone });
    }

    async updateCustomer(phone, updateData) {
        return await Customer.findOneAndUpdate({ phone }, updateData, { new: true });
    }

    async searchCustomers(query) {
        const regex = new RegExp(query, 'i');
        return await Customer.find({
            $or: [{ name: regex }, { phone: regex }]
        });
    }
}

module.exports = new CrmService();
