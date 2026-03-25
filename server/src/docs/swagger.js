const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SaleSync Professional API',
            version: '1.0.0',
            description: 'Professional MERN Stack API for SaleSync Mobile & Electronics Store',
            contact: {
                name: 'SaleSync Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local development server',
            },
        ],
    },
    apis: ['./src/modules/**/*.js'], // Dynamically load docs from all modules
};

module.exports = swaggerJsdoc(options);
