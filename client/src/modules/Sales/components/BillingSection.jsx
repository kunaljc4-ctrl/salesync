
import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, ChevronDown, CheckCircle, Calculator, Percent, Tag, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../common/components/Card';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';

const BillingSection = ({ productList, onComplete }) => {
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [paymentStatus, setPaymentStatus] = useState('Paid');
    const [discount, setDiscount] = useState('0');
    const [advance, setAdvance] = useState('0');
    const [emiTenure, setEmiTenure] = useState('1');
    const [emiInterest, setEmiInterest] = useState('0');
    const [emiProcessingFee, setEmiProcessingFee] = useState('0');
    const [warrantyStart, setWarrantyStart] = useState(new Date().toISOString().split('T')[0]);
    const [warrantyEnd, setWarrantyEnd] = useState('');

    useEffect(() => {
        if (warrantyStart) {
            const start = new Date(warrantyStart);
            const end = new Date(start);
            end.setFullYear(end.getFullYear() + 1);
            setWarrantyEnd(end.toISOString().split('T')[0]);
        }
    }, [warrantyStart]);

    // Calculations
    const itemsSubtotal = productList.reduce((acc, p) => acc + (p.sellingPrice - p.itemDiscount), 0);
    const totalTaxAmount = productList.reduce((acc, p) => acc + ((p.sellingPrice - p.itemDiscount) * (p.taxRate / 100)), 0);
    const globalDiscount = Number(discount) || 0;
    
    let baseAfterDiscount = itemsSubtotal - globalDiscount;
    if (baseAfterDiscount < 0) baseAfterDiscount = 0;

    let totalFinalPrice = Math.ceil(baseAfterDiscount + totalTaxAmount);

    let adv = 0;
    if (paymentMode === 'Credit (Udhaar)' || paymentMode === 'EMI Finance') {
        adv = Number(advance) || 0;
    } else {
        adv = paymentStatus === 'Paid' ? totalFinalPrice : (Number(advance) || 0);
    }

    const balance = totalFinalPrice - adv;

    // EMI Calculation
    let monthlyEMI = 0;
    let totalPayableWithFees = 0;
    if (paymentMode === 'EMI Finance') {
        const tenure = Number(emiTenure) || 1;
        const annualRate = Number(emiInterest) || 0;
        const procFee = Number(emiProcessingFee) || 0;
        const monthlyRate = (annualRate / 100) / 12;

        if (annualRate > 0) {
            monthlyEMI = (balance * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
            totalPayableWithFees = (monthlyEMI * tenure) + procFee + adv;
        } else {
            monthlyEMI = balance / tenure;
            totalPayableWithFees = balance + procFee + adv;
        }
    }

    const handleComplete = () => {
        const billingData = {
            paymentMode,
            paymentStatus,
            discount: globalDiscount,
            advance: adv,
            balance,
            emi: { tenure: emiTenure, interest: emiInterest, fee: emiProcessingFee, monthly: monthlyEMI },
            warranty: { start: warrantyStart, end: warrantyEnd },
            subtotal: itemsSubtotal,
            tax: totalTaxAmount,
            total: totalFinalPrice
        };
        onComplete(billingData);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Configuration */}
                <Card title="Payment & Warranty">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Mode</label>
                                <select 
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Card">Debit/Credit Card</option>
                                    <option value="Credit (Udhaar)">Credit (Udhaar)</option>
                                    <option value="EMI Finance">EMI Finance</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
                                <select 
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="Paid">Paid</option>
                                    <option value="Unpaid">Unpaid</option>
                                    <option value="Partial">Partial</option>
                                </select>
                            </div>
                        </div>

                        {/* Warranty Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Warranty Start" type="date" value={warrantyStart} onChange={(e) => setWarrantyStart(e.target.value)} />
                            <Input label="Warranty End (+1Y)" type="date" value={warrantyEnd} readOnly className="opacity-70" />
                        </div>

                        <AnimatePresence>
                            {(paymentMode === 'EMI Finance' || paymentMode === 'Credit (Udhaar)' || paymentStatus !== 'Paid') && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Advance Paid (₹)" type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} />
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Balance Amount</label>
                                            <div className="h-12 px-4 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center font-bold text-red-600 dark:text-red-400">
                                                ₹{balance.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {paymentMode === 'EMI Finance' && (
                                        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                                            <Input label="Tenure (Months)" type="number" value={emiTenure} onChange={(e) => setEmiTenure(e.target.value)} />
                                            <Input label="Interest Rate (%)" type="number" value={emiInterest} onChange={(e) => setEmiInterest(e.target.value)} />
                                            <Input label="Proc. Fee (₹)" type="number" value={emiProcessingFee} onChange={(e) => setEmiProcessingFee(e.target.value)} />
                                            
                                            <div className="col-span-3 mt-2 pt-2 border-t border-primary/10">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-primary/70">Estimated Monthly EMI</span>
                                                    <span className="text-xl font-black text-primary">₹{Math.ceil(monthlyEMI).toLocaleString()}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-1">
                                                    Total Payable: ₹{Math.ceil(totalPayableWithFees).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>

                {/* Invoice Summary Card */}
                <Card title="Billing Summary" className="bg-primary/5 border-primary/20">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-2"><IndianRupee size={16} /> Items Subtotal</span>
                            <span className="font-semibold">₹{itemsSubtotal.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-2"><Tag size={16} /> Global Discount</span>
                            <div className="w-32">
                                <Input 
                                    type="number" 
                                    value={discount} 
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="!h-8 !text-right font-semibold"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-2"><Percent size={16} /> Total Tax (GST)</span>
                            <span className="font-semibold">₹{totalTaxAmount.toLocaleString()}</span>
                        </div>

                        <div className="pt-6 mt-6 border-t border-primary/20">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-xs font-medium text-primary/70 uppercase tracking-wider">Grand Total</div>
                                    <div className="text-4xl font-black text-primary">₹{totalFinalPrice.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] items-center gap-1 inline-flex text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded-full">
                                        <CheckCircle size={10} /> SAVINGS: ₹{Number(discount).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-white/5">
                                <div className="text-[10px] uppercase text-gray-500 font-bold">Advance</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">₹{adv.toLocaleString()}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-white/5">
                                <div className="text-[10px] uppercase text-gray-500 font-bold">Balance</div>
                                <div className="text-lg font-bold text-red-600">₹{balance.toLocaleString()}</div>
                            </div>
                        </div>

                        <Button 
                            className="w-full mt-6 h-14 text-lg shadow-xl shadow-primary/20" 
                            onClick={handleComplete}
                            disabled={productList.length === 0}
                        >
                            Complete & Generate Invoice
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default BillingSection;
