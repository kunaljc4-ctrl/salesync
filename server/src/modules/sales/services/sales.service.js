const Sale = require('../models/Sale');
const inventoryService = require('../../inventory/services/inventory.service');
const crmService = require('../../crm/services/crm.service');

class SalesService {
    async createSale(saleData) {
        // 1. Save Sale
        const sale = new Sale(saleData);
        await sale.save();

        // 2. Update Customer in CRM
        const customer = await crmService.getCustomerByPhone(saleData.customerPhone);
        if (customer) {
            await crmService.updateCustomer(saleData.customerPhone, {
                totalSpend: customer.totalSpend + saleData.grandTotal,
                totalVisits: customer.totalVisits + 1,
                lastVisit: new Date(),
                tags: (customer.totalSpend + saleData.grandTotal) > 50000 ? ['VIP'] : ['Returning']
            });
        } else {
            await crmService.createCustomer({
                name: saleData.customerName,
                phone: saleData.customerPhone,
                altPhone: saleData.altPhone,
                email: saleData.customerEmail,
                address: saleData.customerAddress,
                totalSpend: saleData.grandTotal,
                totalVisits: 1,
                tags: ['New']
            });
        }

        // 3. Decrement Stock in Inventory
        for (const item of saleData.products) {
            await inventoryService.decrementStock(item.brand, item.model, 1);
        }

        return sale;
    }

    async getAllSales() {
        return await Sale.find().sort({ createdAt: -1 });
    }

    async getSaleByInvoiceId(invoiceId) {
        return await Sale.findOne({ invoiceId });
    }

    async getSalesByCustomerPhone(phone) {
        return await Sale.find({ customerPhone: phone }).sort({ createdAt: -1 });
    }
}

module.exports = new SalesService();
