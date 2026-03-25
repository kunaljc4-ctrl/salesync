
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        console.error('API Error:', message);
        return Promise.reject(error);
    }
);

export default api;
