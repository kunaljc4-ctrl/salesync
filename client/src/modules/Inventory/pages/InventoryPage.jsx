
import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, AlertTriangle, Edit3, Trash2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../common/components/Card';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import { getInventory, createInventoryItem, deleteInventoryItem } from '../services/inventory.api';
import { SPEC_RULES } from '../../Sales/constants/masterData';

const InventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    
    // New Item State
    const [newItem, setNewItem] = useState({
        category: '',
        brand: '',
        model: '',
        cost: '',
        price: '',
        stock: '0',
    });

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const data = await getInventory();
            setInventory(data.results || []);
        } catch (err) {
            console.error("Failed to load inventory:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.category || !newItem.brand || !newItem.model || !newItem.cost || !newItem.price) {
            alert("Please fill all required fields");
            return;
        }

        try {
            await createInventoryItem({
                ...newItem,
                cost: Number(newItem.cost),
                price: Number(newItem.price),
                stock: Number(newItem.stock)
            });
            setShowAddModal(false);
            setNewItem({ category: '', brand: '', model: '', cost: '', price: '', stock: '0' });
            loadInventory();
            alert("Item added to inventory!");
        } catch (err) {
            alert("Failed to add item: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await deleteInventoryItem(id);
            loadInventory();
        } catch (err) {
            alert("Failed to delete item");
        }
    };

    const filteredInventory = inventory.filter(item => 
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Inventory Hub</h1>
                    <p className="text-gray-500 mt-1">Real-time stock tracking and warehouse management.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search inventory..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 h-12 pl-12 pr-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>
                    <Button icon={<Plus size={20} />} onClick={() => setShowAddModal(true)}>Add Stock</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-primary/5 border-primary/20">
                    <div className="text-[10px] uppercase font-bold text-primary/70 mb-1">Total Stock Value</div>
                    <div className="text-2xl font-black text-primary">₹{inventory.reduce((acc, i) => acc + (i.cost * i.stock), 0).toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                        <TrendingUp size={10} /> Market appraisal
                    </div>
                </Card>
                <Card className="bg-orange-500/5 border-orange-500/20">
                    <div className="text-[10px] uppercase font-bold text-orange-600/70 mb-1">Low Stock Alerts</div>
                    <div className="text-2xl font-black text-orange-600">{inventory.filter(i => i.stock <= i.lowStockThreshold).length} Items</div>
                    <div className="text-[10px] text-orange-600/60 mt-2 flex items-center gap-1">
                        <AlertTriangle size={10} /> Needs reordering
                    </div>
                </Card>
                {/* More stats... */}
            </div>

            <Card title="Stock Inventory List" noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Item Details</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Category</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Financials</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Stock Level</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-400">Loading inventory data...</td></tr>
                            ) : filteredInventory.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-400">No items found matching your search.</td></tr>
                            ) : (
                                filteredInventory.map((item) => (
                                    <tr key={item._id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">{item.brand}</div>
                                            <div className="text-xs text-gray-500">{item.model}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-[10px] font-bold uppercase">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-semibold">Cost: ₹{item.cost.toLocaleString()}</div>
                                            <div className="text-xs text-primary font-bold">MRP: ₹{item.price.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${item.stock <= item.lowStockThreshold ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${Math.min((item.stock / 20) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-xs font-black ${item.stock <= item.lowStockThreshold ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {item.stock}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-primary transition-all"><Edit3 size={16} /></button>
                                                <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Item Modal (Simplified) */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowAddModal(false)}
                        ></motion.div>
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative z-10"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                <h2 className="font-black text-xl">Add New Inventory Item</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-500">Category</label>
                                        <select 
                                            value={newItem.category}
                                            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                                            className="w-full h-10 px-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-primary text-sm"
                                        >
                                            <option value="">Select Category</option>
                                            {Object.keys(SPEC_RULES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <Input label="Brand" value={newItem.brand} onChange={(e) => setNewItem({...newItem, brand: e.target.value})} />
                                </div>
                                <Input label="Model Name" value={newItem.model} onChange={(e) => setNewItem({...newItem, model: e.target.value})} />
                                <div className="grid grid-cols-3 gap-4">
                                    <Input label="Cost Price" type="number" value={newItem.cost} onChange={(e) => setNewItem({...newItem, cost: e.target.value})} />
                                    <Input label="Selling Price" type="number" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} />
                                    <Input label="Initial Stock" type="number" value={newItem.stock} onChange={(e) => setNewItem({...newItem, stock: e.target.value})} />
                                </div>
                                <div className="pt-6">
                                    <Button className="w-full" onClick={handleAddItem}>Save to Inventory</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryPage;
