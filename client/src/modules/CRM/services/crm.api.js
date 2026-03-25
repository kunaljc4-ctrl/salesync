
import api from '../../../common/services/api';

export const getCustomers = async () => {
    const response = await api.get('/crm/customers');
    return response.data;
};

export const getCustomerByPhone = async (phone) => {
    const response = await api.get(`/crm/customers/${phone}`);
    return response.data;
};

export const updateCustomer = async (id, customerData) => {
    const response = await api.put(`/crm/customers/${id}`, customerData);
    return response.data;
};

export const searchInvoices = async (query) => {
    const response = await api.get(`/crm/invoices/search?q=${query}`);
    return response.data;
};
