
import React, { useState } from 'react';
import { User, Package, CreditCard, CheckCircle, ChevronRight, ChevronLeft, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerSection from '../components/CustomerSection';
import ProductSection from '../components/ProductSection';
import BillingSection from '../components/BillingSection';
import Card from '../../../common/components/Card';
import Button from '../../../common/components/Button';
import { createInvoice } from '../services/sales.api';

const steps = [
    { id: 'customer', title: 'Customer Details', icon: <User size={20} /> },
    { id: 'product', title: 'Add Products', icon: <Package size={20} /> },
    { id: 'billing', title: 'Payment & Billing', icon: <CreditCard size={20} /> }
];

const SalesPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [customerData, setCustomerData] = useState({});
    const [productList, setProductList] = useState([]);
    const [billingData, setBillingData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [invoiceSuccess, setInvoiceSuccess] = useState(null);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleProductAdd = (product) => {
        setProductList([...productList, product]);
    };

    const handleProductRemove = (id) => {
        setProductList(productList.filter(p => p.id !== id));
    };

    const handleCompleteInvoice = async (billing) => {
        setIsSubmitting(true);
        try {
            // Generate Invoice ID (SS-YYYYMMDD-XXXX)
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const generatedInvoiceId = `SS-${dateStr}-${randomSuffix}`;

            const finalData = {
                invoiceId: generatedInvoiceId,
                customerName: customerData.name,
                customerPhone: customerData.phone,
                altPhone: customerData.altPhone || '',
                customerEmail: customerData.email || '',
                customerAddress: customerData.address || '',
                purchaseDate: now,
                products: productList.map(p => ({
                    ...p,
                    taxAmount: (p.sellingPrice - p.itemDiscount) * (p.taxRate / 100)
                })),
                subtotal: billing.subtotal,
                discount: billing.discount,
                grandTotal: billing.total,
                paymentMode: billing.paymentMode,
                paymentStatus: billing.paymentStatus,
                advance: billing.advance,
                balance: billing.balance,
                warrantyStart: billing.warranty.start,
                warrantyEnd: billing.warranty.end,
                emiDetails: billing.paymentMode === 'EMI Finance' ? {
                    tenure: Number(billing.emi.tenure),
                    interest: Number(billing.emi.interest),
                    processingFee: Number(billing.emi.fee),
                    monthlyEmi: Math.ceil(billing.emi.monthly)
                } : undefined
            };
            
            const result = await createInvoice(finalData);
            setInvoiceSuccess(result);
            console.log("INVOICE CREATED:", result);
            alert(`Invoice ${generatedInvoiceId} Generated Successfully!`);
            
            // Optionally reset state or redirect to a success view
            // setProductList([]);
            // setCustomerData({});
            // setCurrentStep(0);
        } catch (error) {
            console.error("FAILED TO CREATE INVOICE:", error);
            const errorMsg = error.response?.data?.message || error.message;
            alert(`Failed to generate invoice: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Create New Invoice</h1>
                    <p className="text-gray-500 mt-1">Fill in the details below to generate a professional invoice.</p>
                </div>
                
                {/* Stepper Progress */}
                <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-gray-100 dark:border-white/10">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                                    currentStep === index 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                                    : currentStep > index 
                                        ? 'text-primary' 
                                        : 'text-gray-400'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                    currentStep === index ? 'border-white/30 bg-white/20' : 'border-current'
                                }`}>
                                    {currentStep > index ? <CheckCircle size={16} /> : step.icon}
                                </div>
                                <span className={`text-sm font-bold whitespace-nowrap hidden sm:inline ${currentStep === index ? 'block' : 'opacity-70'}`}>
                                    {step.title}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="mx-2 text-gray-300 dark:text-white/10">
                                    <ChevronRight size={20} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep === 0 && (
                            <CustomerSection 
                                data={customerData} 
                                onChange={setCustomerData} 
                                onNext={handleNext} 
                            />
                        )}
                        
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <ProductSection 
                                    productList={productList} 
                                    onProductAdd={handleProductAdd} 
                                    onProductRemove={handleProductRemove} 
                                />
                                <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                                    <Button variant="outline" icon={<ChevronLeft size={20} />} onClick={handleBack}>
                                        Back to Customer
                                    </Button>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-[10px] uppercase font-bold text-gray-500">Items Count</div>
                                            <div className="text-xl font-black text-primary">{productList.length}</div>
                                        </div>
                                        <Button 
                                            icon={<ChevronRight size={20} />} 
                                            onClick={handleNext}
                                            disabled={productList.length === 0}
                                        >
                                            Continue to Billing
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <BillingSection 
                                    productList={productList} 
                                    onComplete={handleCompleteInvoice} 
                                />
                                <div className="flex justify-start">
                                    <Button variant="outline" icon={<ChevronLeft size={20} />} onClick={handleBack}>
                                        Back to Products
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            
            {/* Floating Summary Bar (Mobile/Sticky) */}
            {productList.length > 0 && currentStep < 2 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-50">
                    <div className="bg-black/80 dark:bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-white/10 dark:border-black/10 shadow-2xl flex items-center justify-between text-white dark:text-black">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white">
                                <Receipt size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase font-bold opacity-60">Pending Invoice</div>
                                <div className="text-sm font-bold">{productList.length} Items Added</div>
                            </div>
                        </div>
                        <Button variant="primary" size="sm" className="h-10 px-6 rounded-2xl" onClick={() => setCurrentStep(2)}>
                            Review & Pay
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesPage;
