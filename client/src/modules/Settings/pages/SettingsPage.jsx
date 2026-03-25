
import React, { useState, useEffect } from 'react';
import { Settings, Save, Shield, Database, Terminal, Globe, Bell, CreditCard, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../../../common/components/Card';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import { getSettings, updateSettings } from '../services/settings.api';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        storeName: '',
        storeAddress: '',
        storePhone: '',
        storeEmail: '',
        gstNumber: '',
        invoicePrefix: 'SS',
        termsAndConditions: ''
    });
    const [isDevMode, setIsDevMode] = useState(() => localStorage.getItem('isDevMode') === 'true');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await getSettings();
            if (data.result) {
                setSettings(data.result);
            }
        } catch (err) {
            console.error("Failed to load settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSettings(settings);
            alert("Settings updated successfully!");
        } catch (err) {
            alert("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const toggleDevMode = () => {
        const newValue = !isDevMode;
        setIsDevMode(newValue);
        localStorage.setItem('isDevMode', newValue);
        alert(`Developer Mode ${newValue ? 'Enabled' : 'Disabled'}`);
        window.location.reload(); // Reload to apply changes globally
    };

    if (loading) return <div className="p-20 text-center text-gray-400 font-bold">Loading system configuration...</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">System Settings</h1>
                    <p className="text-gray-500 mt-1">Configure your store profile and application preferences.</p>
                </div>
                <Button icon={<Save size={20} />} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Sidebar - Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 transition-all">
                        <Settings size={20} /> Store Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 text-slate-gray font-bold transition-all grayscale opacity-50 cursor-not-allowed">
                        <Bell size={20} /> Notifications
                    </button>
                    <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 text-slate-gray font-bold transition-all grayscale opacity-50 cursor-not-allowed">
                        <Shield size={20} /> Security
                    </button>
                    <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 text-slate-gray font-bold transition-all grayscale opacity-50 cursor-not-allowed">
                        <Database size={20} /> Data Export
                    </button>
                    
                    <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/5">
                        <div className="px-6 mb-4 text-[10px] uppercase font-black text-gray-400 tracking-widest">Advanced</div>
                        <button 
                            onClick={toggleDevMode}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold ${isDevMode ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' : 'hover:bg-white/50 dark:hover:bg-white/5 text-slate-gray'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Terminal size={20} /> Developer Mode
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-all ${isDevMode ? 'bg-orange-500' : 'bg-gray-200 dark:bg-white/10'}`}>
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isDevMode ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right Content - Forms */}
                <div className="lg:col-span-2 space-y-8">
                    <Card title="Business Information">
                        <div className="space-y-6">
                            <Input 
                                label="Store / Business Name" 
                                value={settings.storeName} 
                                onChange={(e) => setSettings({...settings, storeName: e.target.value})} 
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Address</label>
                                <textarea 
                                    className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                    value={settings.storeAddress}
                                    onChange={(e) => setSettings({...settings, storeAddress: e.target.value})}
                                    placeholder="Full street address, city, state, zip"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Contact Phone" value={settings.storePhone} onChange={(e) => setSettings({...settings, storePhone: e.target.value})} />
                                <Input label="Store Email" value={settings.storeEmail} onChange={(e) => setSettings({...settings, storeEmail: e.target.value})} />
                            </div>
                            <Input label="GSTIN / Tax ID" value={settings.gstNumber} onChange={(e) => setSettings({...settings, gstNumber: e.target.value})} />
                        </div>
                    </Card>

                    <Card title="Invoice Customization">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6 items-end">
                                <Input label="Invoice Prefix" value={settings.invoicePrefix} onChange={(e) => setSettings({...settings, invoicePrefix: e.target.value})} />
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10">
                                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Preview ID</div>
                                    <div className="text-sm font-mono font-bold text-primary">{settings.invoicePrefix}-20260325-1234</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Terms & Conditions</label>
                                <textarea 
                                    className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                    value={settings.termsAndConditions}
                                    onChange={(e) => setSettings({...settings, termsAndConditions: e.target.value})}
                                />
                            </div>
                        </div>
                    </Card>

                    <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shrink-0">
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-700 dark:text-blue-400">Need help with configuration?</h4>
                            <p className="text-sm text-blue-600/80 dark:text-blue-400/60 mt-1">Changes made here affect all invoices generated from this point forward. Legacy invoices remain unchanged.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
