import React from 'react';
import Card from '../../../common/components/Card';
import Input from '../../../common/components/Input';
import { User, Phone, Mail, MapPin } from 'lucide-react';

const CustomerSection = ({ customerData, setCustomerData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card title="Customer Information" icon={<User className="text-primary" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          name="customerName"
          placeholder="e.g. John Doe"
          value={customerData.customerName}
          onChange={handleChange}
          required
        />
        <Input
          label="Primary Phone"
          name="customerPhone"
          placeholder="10-digit number"
          value={customerData.customerPhone}
          onChange={handleChange}
          maxLength={10}
          required
        />
        <Input
          label="Alternate Phone"
          name="altPhone"
          placeholder="Optional"
          value={customerData.altPhone}
          onChange={handleChange}
          maxLength={10}
        />
        <Input
          label="Email Address"
          name="customerEmail"
          type="email"
          placeholder="john@example.com"
          value={customerData.customerEmail}
          onChange={handleChange}
        />
        <div className="md:col-span-2">
          <Input
            label="Home/Business Address"
            name="customerAddress"
            placeholder="Complete address for invoice"
            value={customerData.customerAddress}
            onChange={handleChange}
          />
        </div>
      </div>
    </Card>
  );
};

export default CustomerSection;
