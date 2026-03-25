
import api from '../../../common/services/api';

export const getInventory = async () => {
    const response = await api.get('/inventory');
    return response.data;
};

export const createInventoryItem = async (itemData) => {
    const response = await api.post('/inventory', itemData);
    return response.data;
};

export const updateInventoryItem = async (id, itemData) => {
    const response = await api.put(`/inventory/${id}`, itemData);
    return response.data;
};

export const deleteInventoryItem = async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
};

export const searchInventory = async (query) => {
    const response = await api.get(`/inventory/search?q=${query}`);
    return response.data;
};
