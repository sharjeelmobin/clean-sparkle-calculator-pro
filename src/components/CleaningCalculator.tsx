import React, { useState, useEffect } from 'react';
import { Home, Zap, Package, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface CleaningType {
  id: string;
  name: string;
  baseRate: number;
  timeMultiplier: number;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
}

const cleaningTypes: CleaningType[] = [
  { id: 'standard', name: 'Standard Clean – Everyday Sparkle', baseRate: 0.20, timeMultiplier: 1 },
  { id: 'deep', name: 'Deep Clean – Total Rejuvenation', baseRate: 0.35, timeMultiplier: 1.5 },
  { id: 'movein', name: 'Move-In/Out Clean – Fresh Start', baseRate: 0.30, timeMultiplier: 1.3 }
];

const addOns: AddOn[] = [
  { id: 'oven', name: 'Sparkling Oven Cleaning', price: 57.50 },
  { id: 'fridge', name: 'Fresh Refrigerator Cleaning', price: 57.50 }
];

const coupons: Record<string, number> = {
  'MoM10': 0.10,
  'MoM20': 0.20,
  'MoM30': 0.30
};

// Tax rate mappings by ZIP code
const getTaxRate = (zipCode: string): number => {
  const zip = zipCode.trim();
  
  // Group 6: Village of Tijeras — 8.075%
  if (zip === '87059') return 0.08075;
  
  // Group 3: Rio Rancho (Sandoval County) — 7.875%
  if (['87124', '87144', '87174'].includes(zip)) return 0.07875;
  
  // Group 2: Albuquerque (Bernalillo County – city area) — 7.625%
  const albuquerqueZips = [
    '87101', '87102', '87103', '87104', '87105', '87106', '87107', '87108', '87109', '87110',
    '87111', '87112', '87113', '87114', '87115', '87116', '87117', '87119', '87120', '87121',
    '87122', '87123', '87125', '87131', '87144', '87153', '87154', '87176', '87181', '87184',
    '87185', '87187', '87190', '87191', '87192', '87193', '87194', '87195', '87196', '87197',
    '87198', '87199'
  ];
  if (albuquerqueZips.includes(zip)) return 0.07625;
  
  // Group 1: Los Ranchos de Albuquerque — 7.187%
  if (['87107', '87114'].includes(zip)) return 0.07187;
  
  // Group 4: Sandoval County (outside Rio Rancho) — 6.375%
  if (['87004', '87013', '87024', '87025', '87041', '87043', '87044', '87053', '87072', '87083'].includes(zip)) return 0.06375;
  
  // Group 5: Remainder of Bernalillo County (outside Albuquerque city) — 6.187%
  if (['87008', '87022', '87047', '87068'].includes(zip)) return 0.06187;
  
  return 0; // No tax for other ZIP codes
};

const CleaningCalculator: React.FC = () => {
  const [squareFootage, setSquareFootage] = useState([1500]);
  const [cleaningType, setCleaningType] = useState('standard');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    zipCode: '',
    fullName: '',
    email: '',
    phone: ''
  });

  const calculateCost = () => {
    const selectedType = cleaningTypes.find(type => type.id === cleaningType);
    if (!selectedType) return { subtotal: 0, discount: 0, tax: 0, total: 0, laborHours: 0, taxRate: 0 };

    const baseCost = squareFootage[0] * selectedType.baseRate;
    const addOnsCost = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find(a => a.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);

    const subtotal = baseCost + addOnsCost;
    const discount = appliedCoupon ? subtotal * (coupons[appliedCoupon] || 0) : 0;
    const afterDiscount = subtotal - discount;
    
    // Calculate tax based on ZIP code
    const taxRate = getTaxRate(bookingForm.zipCode);
    const tax = afterDiscount * taxRate;
    const total = afterDiscount + tax;
    
    const laborHours = Math.ceil((squareFootage[0] / 1000) * selectedType.timeMultiplier * 2);

    return { subtotal, discount, tax, total, laborHours, taxRate };
  };

  const handleCouponApply = () => {
    if (coupons[couponCode]) {
      setAppliedCoupon(couponCode);
    } else {
      setAppliedCoupon('');
    }
  };

  const handleAddOnChange = (addOnId: string, checked: boolean) => {
    if (checked) {
      setSelectedAddOns([...selectedAddOns, addOnId]);
    } else {
      setSelectedAddOns(selectedAddOns.filter(id => id !== addOnId));
    }
  };

  const { total, laborHours, discount, tax, taxRate } = calculateCost();

  if (showBookingForm) {
    return (
      <div className="min-h-screen bg-calculator-bg p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <Card className="p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-foreground mb-6">Book Your Cleaning</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={bookingForm.zipCode}
                    onChange={(e) => setBookingForm({...bookingForm, zipCode: e.target.value})}
                    placeholder="Enter your ZIP code"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={bookingForm.fullName}
                    onChange={(e) => setBookingForm({...bookingForm, fullName: e.target.value})}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1"
                  >
                    Back to Calculator
                  </Button>
                  <Button className="flex-1 bg-button-primary hover:bg-button-primary-hover">
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </Card>

            {/* Booking Summary */}
            <Card className="p-6 shadow-lg bg-cost-bg/30">
              <h3 className="text-xl font-bold text-foreground mb-4">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Square Footage:</span>
                  <span className="font-medium">{squareFootage[0]} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning Type:</span>
                  <span className="font-medium">{cleaningTypes.find(t => t.id === cleaningType)?.name}</span>
                </div>
                {selectedAddOns.length > 0 && (
                  <div>
                    <span>Add-ons:</span>
                    {selectedAddOns.map(addOnId => {
                      const addOn = addOns.find(a => a.id === addOnId);
                      return (
                        <div key={addOnId} className="flex justify-between ml-4">
                          <span>• {addOn?.name}</span>
                          <span className="font-medium">+${addOn?.price.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-cost-text">
                    <span>Coupon ({appliedCoupon}):</span>
                    <span className="font-medium">-${discount.toFixed(2)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({(taxRate * 100).toFixed(3)}%):</span>
                    <span className="font-medium">+${tax.toFixed(2)}</span>
                  </div>
                )}
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Cost:</span>
                  <span className="text-cost-text">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Estimated Labor:</span>
                  <span>{laborHours} hrs</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-calculator-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Square Footage */}
            <Card className="p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-cost-text" />
                <h3 className="text-lg font-semibold text-foreground">
                  Square Footage: <span className="text-cost-text">{squareFootage[0]} sq ft</span>
                </h3>
              </div>
              <div className="space-y-4">
                <Slider
                  value={squareFootage}
                  onValueChange={setSquareFootage}
                  min={500}
                  max={5000}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>500 sq ft</span>
                  <span>5000 sq ft</span>
                </div>
              </div>
            </Card>

            {/* Cleaning Type */}
            <Card className="p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-cost-text" />
                <h3 className="text-lg font-semibold text-foreground">Cleaning Type</h3>
              </div>
              <Select value={cleaningType} onValueChange={setCleaningType}>
                <SelectTrigger className="w-full border-2 border-cost-text/20 focus:border-cost-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cleaningTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Optional Add-ons */}
            <Card className="p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-cost-text" />
                <h3 className="text-lg font-semibold text-foreground">Optional Add-ons</h3>
              </div>
              <div className="space-y-3">
                {addOns.map(addOn => (
                  <div key={addOn.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                    <Checkbox
                      id={addOn.id}
                      checked={selectedAddOns.includes(addOn.id)}
                      onCheckedChange={(checked) => handleAddOnChange(addOn.id, checked as boolean)}
                      className="border-cost-text data-[state=checked]:bg-cost-text"
                    />
                    <Label htmlFor={addOn.id} className="flex-1 cursor-pointer">
                      {addOn.name} (+${addOn.price.toFixed(2)})
                    </Label>
                  </div>
                ))}
              </div>
            </Card>

            {/* ZIP Code */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">ZIP Code</h3>
              <Input
                value={bookingForm.zipCode}
                onChange={(e) => setBookingForm({...bookingForm, zipCode: e.target.value})}
                placeholder="Enter your ZIP code for tax calculation"
                className="w-full"
              />
              {bookingForm.zipCode && tax > 0 && (
                <div className="mt-2 text-sm text-cost-text">
                  ✓ Tax rate: {(taxRate * 100).toFixed(3)}% (+${tax.toFixed(2)})
                </div>
              )}
            </Card>

            {/* Coupon Code */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">Coupon Code</h3>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1"
                />
                <Button 
                  onClick={handleCouponApply}
                  variant="outline"
                  className="border-cost-text text-cost-text hover:bg-cost-text hover:text-white"
                >
                  Apply
                </Button>
              </div>
              {appliedCoupon && (
                <div className="mt-2 text-sm text-cost-text">
                  ✓ Coupon "{appliedCoupon}" applied ({(coupons[appliedCoupon] * 100).toFixed(0)}% off)
                </div>
              )}
            </Card>
          </div>

          {/* Cost Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-xl bg-cost-bg/20 border-cost-text/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Estimated Labor: {laborHours} hrs</span>
                </div>
                
                <div className="mb-6">
                  <div className="text-lg text-cost-text font-medium mb-1">💵 Your Estimated Cost</div>
                  <div className="text-5xl font-bold text-cost-text">${total.toFixed(0)}</div>
                </div>

                <div className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  This is an estimate. Price may vary based on the overall condition of your home. Our cleaning tech may request additional time if more work is desired. All fees beyond refrigerator and oven are charged by the hour. We proudly offer a 24-hour warranty on the work performed.
                </div>

                <Button 
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-button-primary hover:bg-button-primary-hover text-white font-semibold py-3 text-lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book This Clean
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningCalculator;