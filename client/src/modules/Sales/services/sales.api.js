
import api from '../../../common/services/api';

export const createInvoice = async (invoiceData) => {
    try {
        const response = await api.post('/sales', invoiceData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllInvoices = async () => {
    try {
        const response = await api.get('/sales');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getInvoiceById = async (id) => {
    try {
        const response = await api.get(`/sales/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
