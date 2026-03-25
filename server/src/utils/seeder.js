
const mongoose = require('mongoose');
require('dotenv').config();
const Inventory = require('../modules/inventory/models/Inventory');

const brands = {
    Mobile: ["Apple", "Samsung", "Google Pixel", "Xiaomi", "OnePlus"],
    Laptop: ["Apple MacBook", "Dell Laptop", "HP Laptop", "Lenovo Laptop"],
    Tablet: ["Apple iPad", "Samsung Tablet", "Lenovo Tablet"],
    Smartwatch: ["Apple Watch", "Samsung Watch", "Amazfit Watch"],
};

const models = {
    Apple: ["iPhone 16 Pro Max", "iPhone 15", "iPhone 14"],
    Samsung: ["Galaxy S24 Ultra", "Galaxy A55"],
    "Apple MacBook": ["MacBook Pro M3", "MacBook Air M2"],
    "Dell Laptop": ["XPS 13", "Inspiron 15"],
};

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27012/salesync');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing inventory
        await Inventory.deleteMany({});

        const seedItems = [];
        for (const [category, brandList] of Object.entries(brands)) {
            for (const brand of brandList) {
                const modelList = models[brand] || [`Generic ${brand} ${category}`];
                for (const model of modelList) {
                    seedItems.push({
                        category,
                        brand,
                        model,
                        cost: Math.floor(Math.random() * 50000) + 5000,
                        price: Math.floor(Math.random() * 70000) + 10000,
                        stock: Math.floor(Math.random() * 20) + 1,
                        specs: new Map([["Condition", "New"]])
                    });
                }
            }
        }

        await Inventory.insertMany(seedItems);
        console.log(`Successfully seeded ${seedItems.length} inventory items.`);
        
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
