require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/docs/swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27012/salesync';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Modular Routes
app.use('/api/sales', require('./src/modules/sales/routes/sales.routes'));
app.use('/api/crm', require('./src/modules/crm/routes/crm.routes'));
app.use('/api/inventory', require('./src/modules/inventory/routes/inventory.routes'));
app.use('/api/settings', require('./src/modules/settings/routes/settings.routes'));

app.get('/', (req, res) => {
    res.send('SaleSync Modular API is running. Access docs at /api-docs');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
