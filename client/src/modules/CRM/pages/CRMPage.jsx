
import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Phone, Mail, MapPin, Receipt, Calendar, ExternalLink, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../common/components/Card';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import { getCustomers, searchInvoices } from '../services/crm.api';

const CRMPage = () => {
    const [activeTab, setActiveTab] = useState('customers');
    const [customers, setCustomers] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (activeTab === 'customers') {
            loadCustomers();
        }
    }, [activeTab]);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data.results || []);
        } catch (err) {
            console.error("Failed to load customers:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchInvoice = async (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (val.length > 2) {
            try {
                const data = await searchInvoices(val);
                setInvoices(data.results || []);
            } catch (err) {
                console.error("Invoice search failed:", err);
            }
        } else if (val === '') {
            setInvoices([]);
        }
    };

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Customer Relations</h1>
                    <p className="text-gray-500 mt-1">Insights, loyalty programs, and purchase history tracking.</p>
                </div>
                
                {/* Tab Switcher */}
                <div className="flex p-1.5 bg-gray-100 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10">
                    <button 
                        onClick={() => { setActiveTab('customers'); setSearchTerm(''); }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'customers' ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-lg' : 'text-gray-500'}`}
                    >
                        <Users size={16} /> Customers
                    </button>
                    <button 
                        onClick={() => { setActiveTab('invoices'); setSearchTerm(''); }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'invoices' ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-lg' : 'text-gray-500'}`}
                    >
                        <Receipt size={16} /> Find Invoice
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'customers' ? (
                        <motion.div 
                            key="customers"
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        >
                            <div className="mb-6 flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search by name or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-black/20 outline-none focus:ring-2 focus:ring-primary transition-all"
                                    />
                                </div>
                                <Button variant="outline" icon={<Filter size={18} />}>Filter</Button>
                            </div>

                            <Card noPadding>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                                                <th className="px-6 py-4 font-bold text-xs uppercase text-gray-400">Customer Info</th>
                                                <th className="px-6 py-4 font-bold text-xs uppercase text-gray-400">Total Spend</th>
                                                <th className="px-6 py-4 font-bold text-xs uppercase text-gray-400">Visits</th>
                                                <th className="px-6 py-4 font-bold text-xs uppercase text-gray-400">Tag</th>
                                                <th className="px-6 py-4 font-bold text-xs uppercase text-gray-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="5" className="p-20 text-center text-gray-400">Loading customers...</td></tr>
                                            ) : filteredCustomers.length === 0 ? (
                                                <tr><td colSpan="5" className="p-20 text-center text-gray-400">No customers found.</td></tr>
                                            ) : filteredCustomers.map(customer => (
                                                <tr key={customer._id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                            {customer.name}
                                                            {customer.totalSpend > 50000 && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                                                        </div>
                                                        <div className="text-xs text-slate-gray flex items-center gap-1 mt-1">
                                                            <Phone size={10} /> {customer.phone}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-black text-primary">₹{customer.totalSpend.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black">{customer.totalVisits}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {(customer.tags || []).map(tag => (
                                                            <span key={tag} className="px-2 py-0.5 rounded-lg bg-green-500/10 text-green-600 text-[10px] font-black uppercase tracking-wider">{tag}</span>
                                                        ))}
                                                        {(!customer.tags || customer.tags.length === 0) && <span className="text-gray-300 text-[10px]">No Tags</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="p-2 text-gray-400 hover:text-primary transition-all opacity-0 group-hover:opacity-100"><ExternalLink size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="invoices"
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        >
                            <div className="max-w-2xl mx-auto mb-10 text-center">
                                <h3 className="text-xl font-black mb-3">Global Invoice Search</h3>
                                <p className="text-gray-500 text-sm mb-6">Enter Invoice ID, Customer Phone, or IMEI/Serial to bypass traditional navigation.</p>
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                                    <input 
                                        type="text" 
                                        placeholder="Search across all modules..."
                                        value={searchTerm}
                                        onChange={handleSearchInvoice}
                                        className="w-full h-20 pl-16 pr-6 rounded-[2.5rem] border-2 border-gray-100 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-xl outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-xl font-bold font-mono"
                                    />
                                </div>
                            </div>

                            {invoices.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {invoices.map(inv => (
                                        <Card key={inv._id} className="hover:border-primary/40 transition-all cursor-pointer group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                    <Receipt size={20} />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-gray-400">#{inv.invoiceId.split('-').pop()}</div>
                                                    <div className={`text-[10px] font-black uppercase ${inv.paymentStatus === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>{inv.paymentStatus}</div>
                                                </div>
                                            </div>
                                            <div className="space-y-1 mb-4">
                                                <div className="font-black text-gray-900 dark:text-white">{inv.customerName}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} /> {inv.customerPhone}</div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                                                <div>
                                                    <div className="text-[10px] uppercase font-bold text-gray-400">Total Amount</div>
                                                    <div className="text-xl font-black text-primary">₹{inv.grandTotal.toLocaleString()}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] flex items-center gap-1 text-gray-400 font-bold"><Calendar size={10} /> {new Date(inv.purchaseDate).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {searchTerm.length > 2 && invoices.length === 0 && (
                                <div className="p-20 text-center text-gray-400 flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                                        <Search size={32} className="opacity-20" />
                                    </div>
                                    <p className="font-bold">No invoices matching "{searchTerm}" found.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CRMPage;
