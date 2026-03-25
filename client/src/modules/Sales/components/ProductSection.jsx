
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Box, Cpu, HardDrive, Smartphone, Monitor, Watch, Headphones, Speaker, Battery, Zap, Link, Keyboard, Mouse, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../common/components/Card';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import { BRAND_SUGGESTIONS, MODEL_SUGGESTIONS, SPEC_DEFINITIONS, SPEC_RULES, MASTER_COLORS } from '../constants/masterData';

const ProductSection = ({ onProductAdd, productList, onProductRemove }) => {
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [serial, setSerial] = useState('');
    const [color, setColor] = useState('');
    const [customColor, setCustomColor] = useState('');
    const [batchNo, setBatchNo] = useState('');
    const [purchaseCost, setPurchaseCost] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [discount, setDiscount] = useState('');
    const [taxRate, setTaxRate] = useState('18');
    const [specs, setSpecs] = useState({});
    
    // Developer Mode (simulated for now, could be passed as prop)
    const [isDevMode, setIsDevMode] = useState(() => localStorage.getItem('isDevMode') === 'true');

    // Category Icons Mapping
    const categoryIcons = {
        Mobile: <Smartphone size={18} />,
        Laptop: <Monitor size={18} />,
        Tablet: <Box size={18} />,
        Smartwatch: <Watch size={18} />,
        Earbuds: <Headphones size={18} />,
        Headphones: <Headphones size={18} />,
        Speaker: <Speaker size={18} />,
        PowerBank: <Battery size={18} />,
        Charger: <Zap size={18} />,
        Cable: <Link size={18} />,
        Keyboard: <Keyboard size={18} />,
        Mouse: <Mouse size={18} />,
        Accessory: <MoreHorizontal size={18} />,
        Other: <Box size={18} />
    };

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        setCategory(val);
        setBrand('');
        setModel('');
        setSpecs({});
    };

    const handleSpecChange = (key, val) => {
        setSpecs(prev => ({ ...prev, [key]: val }));
    };

    const handleAddProduct = () => {
        if (!brand || !model || !sellingPrice) {
            alert("Please enter Brand, Model and Selling Price!");
            return;
        }

        const newProduct = {
            id: Date.now(),
            category,
            brand,
            model,
            serial,
            color: color === '_custom_' ? customColor : color,
            batchNo,
            purchaseCost: Number(purchaseCost) || 0,
            sellingPrice: Number(sellingPrice) || 0,
            itemDiscount: Number(discount) || 0,
            taxRate: Number(taxRate) || 0,
            specs
        };

        onProductAdd(newProduct);
        
        // Reset fields
        setCategory('');
        setBrand('');
        setModel('');
        setSerial('');
        setColor('');
        setCustomColor('');
        setBatchNo('');
        setPurchaseCost('');
        setSellingPrice('');
        setDiscount('');
        setSpecs({});
    };

    const specKeys = category ? SPEC_RULES[category] || [] : [];

    return (
        <div className="space-y-6">
            <Card title="Product Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select 
                            value={category}
                            onChange={handleCategoryChange}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        >
                            <option value="">Select Category</option>
                            {Object.keys(SPEC_RULES).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                        <input 
                            list="brand-list"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            placeholder="Enter Brand"
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                        <datalist id="brand-list">
                            {(BRAND_SUGGESTIONS[category] || []).map(b => <option key={b} value={b} />)}
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
                        <input 
                            list="model-list"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="Enter Model"
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                        <datalist id="model-list">
                            {(MODEL_SUGGESTIONS[brand] || []).map(m => <option key={m} value={m} />)}
                        </datalist>
                    </div>
                </div>

                {/* Dynamic Specs */}
                <AnimatePresence>
                    {specKeys.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-white/10"
                        >
                            {specKeys.map(key => {
                                const spec = SPEC_DEFINITIONS[key];
                                return (
                                    <div key={key} className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{spec.label}</label>
                                        <input 
                                            list={`${key}-list`}
                                            value={specs[key] || ''}
                                            onChange={(e) => handleSpecChange(key, e.target.value)}
                                            placeholder={`Enter ${spec.label}`}
                                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                        <datalist id={`${key}-list`}>
                                            {spec.options.map(opt => <option key={opt} value={opt} />)}
                                        </datalist>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    <Input label="Serial Number" placeholder="S/N or IMEI" value={serial} onChange={(e) => setSerial(e.target.value)} />
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                        <select 
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        >
                            <option value="">Select Color</option>
                            {MASTER_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="_custom_">Custom Color...</option>
                        </select>
                        {color === '_custom_' && (
                            <Input 
                                placeholder="Enter custom color" 
                                value={customColor} 
                                onChange={(e) => setCustomColor(e.target.value)} 
                                className="mt-2"
                            />
                        )}
                    </div>

                    <Input label="Batch Number" placeholder="Optional" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} />
                    
                    <Input 
                        label="Purchase Cost (₹)" 
                        type="number" 
                        value={purchaseCost} 
                        onChange={(e) => setPurchaseCost(e.target.value)}
                        readOnly={!isDevMode}
                        className={!isDevMode ? "opacity-60 cursor-not-allowed" : ""}
                    />
                    
                    <Input label="Selling Price (₹)" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Tax (%)" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
                        <Input label="Discount (₹)" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button 
                        icon={<Plus size={20} />} 
                        onClick={handleAddProduct}
                        className="w-full md:w-auto px-10"
                    >
                        Add Product to Invoice
                    </Button>
                </div>
            </Card>

            {/* Added Products Table */}
            {productList.length > 0 && (
                <Card title="Items Added to Invoice">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5">
                                    <th className="py-4 font-semibold text-sm">Product Details</th>
                                    <th className="py-4 font-semibold text-sm">Base Price</th>
                                    <th className="py-4 font-semibold text-sm">Tax</th>
                                    <th className="py-4 font-semibold text-sm">Total</th>
                                    <th className="py-4 font-semibold text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productList.map((p, idx) => {
                                    const basePrice = p.sellingPrice - p.itemDiscount;
                                    const taxAmt = basePrice * (p.taxRate / 100);
                                    const total = basePrice + taxAmt;
                                    
                                    return (
                                        <tr key={p.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        {categoryIcons[p.category] || <Box size={18} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">{p.brand} {p.model}</div>
                                                        <div className="text-xs text-gray-500">{p.category} | {p.serial || 'No Serial'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="text-sm font-medium">₹{basePrice.toLocaleString()}</div>
                                                {p.itemDiscount > 0 && (
                                                    <div className="text-[10px] text-red-500 font-medium line-through">₹{p.sellingPrice.toLocaleString()}</div>
                                                )}
                                            </td>
                                            <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{p.taxRate}%</td>
                                            <td className="py-4 text-sm font-bold text-primary">₹{total.toLocaleString()}</td>
                                            <td className="py-4 text-right">
                                                <button 
                                                    onClick={() => onProductRemove(p.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ProductSection;
