import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Zap,
  Phone
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CheckoutPageProps {
  onNavigate: (route: string, param?: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Multi-step Checkout state
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form Fields
  const [customerName, setCustomerName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+92 ');

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    postalCode: '44000'
  });

  // Billing Address
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    postalCode: '44000'
  });

  // Options
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'payfast' | 'bank_transfer'>('cod');
  const [shippingNotes, setShippingNotes] = useState('');
  const [oldBatteryTradeIn, setOldBatteryTradeIn] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  // Calculations
  const isIslamabad = shippingAddress.city.toLowerCase().includes('islamabad') || shippingAddress.city.toLowerCase().includes('f-10') || shippingAddress.city.toLowerCase().includes('f-11');
  const isRawalpindi = shippingAddress.city.toLowerCase().includes('rawalpindi') || shippingAddress.city.toLowerCase().includes('rwp');
  const shippingFee = isIslamabad ? 0 : isRawalpindi ? (subtotal >= 30000 ? 0 : 500) : 1500;
  const scrapDiscount = oldBatteryTradeIn ? 500 : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - scrapDiscount);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mb-6">Please add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs"
        >
          BROWSE CATALOG
        </button>
      </div>
    );
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (step === 1) {
      if (!customerName || !customerEmail || !customerPhone) {
        setErrorMessage('Please fill in all customer contact fields.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!shippingAddress.addressLine1 || !shippingAddress.city) {
        setErrorMessage('Please provide a complete delivery address.');
        return;
      }
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: {
          ...shippingAddress,
          fullName: shippingAddress.fullName || customerName,
          phone: shippingAddress.phone || customerPhone
        },
        billingAddress: billingSameAsShipping ? undefined : billingAddress,
        billingSameAsShipping,
        paymentMethod,
        shippingNotes,
        oldBatteryTradeIn,
        couponCode: couponCode || undefined,
        items: items.map(it => ({
          productId: it.productId,
          variantId: it.variantId || undefined,
          quantity: it.quantity
        }))
      };

      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Checkout failed. Please review your order.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully!
      await clearCart();

      if (paymentMethod === 'payfast') {
        // Redirect to secure hosted online payment portal
        onNavigate('payment-portal', data.orderId);
      } else {
        // COD or Bank Transfer -> Confirmation page
        onNavigate('order-confirmation', data.orderId);
      }
    } catch (err: any) {
      setErrorMessage('An unexpected network error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-xs font-bold mb-2">
            <Lock className="w-3 h-3 text-red-600" />
            <span>256-Bit Encrypted Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Checkout & Battery Delivery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorised Dealer Stamped Warranty & Roadside Mobile Fitting in Islamabad.
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-red-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                1
              </span>
              <span>Contact Info</span>
            </div>
            <div className={`h-0.5 flex-1 mx-4 ${step >= 2 ? 'bg-red-600' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-red-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                2
              </span>
              <span>Delivery Address</span>
            </div>
            <div className={`h-0.5 flex-1 mx-4 ${step >= 3 ? 'bg-red-600' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-red-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                3
              </span>
              <span>Payment & Review</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Contact Info */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
                  1. Customer Contact Details
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="e.g. tariq@gmail.com"
                      className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Order receipt and official warranty notification will be sent here.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Delivery driver will call on arrival in Islamabad.
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs flex items-center gap-2 shadow"
                  >
                    <span>CONTINUE TO DELIVERY ADDRESS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Delivery & Shipping Address */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>2. Delivery Address (Islamabad & Rawalpindi)</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Edit Contact
                  </button>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <select
                      value={shippingAddress.city}
                      onChange={e => {
                        const val = e.target.value;
                        setShippingAddress({
                          ...shippingAddress,
                          city: val,
                          province: val === 'Islamabad' ? 'Islamabad Capital Territory' : 'Punjab'
                        });
                      }}
                      className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-bold"
                    >
                      <option value="Islamabad">Islamabad (Free Same-Day Delivery)</option>
                      <option value="Rawalpindi">Rawalpindi City / Cantt</option>
                      <option value="Lahore">Lahore (Pallet Courier)</option>
                      <option value="Peshawar">Peshawar (Pallet Courier)</option>
                      <option value="Karachi">Karachi (Pallet Courier)</option>
                      <option value="Other">Other City in Pakistan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sector / Area / Sub-locality</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.addressLine2}
                      onChange={e => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                      placeholder="e.g. F-10/2, G-11/3, Bahria Phase 7"
                      className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address & House / Plaza Number</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.addressLine1}
                    onChange={e => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    placeholder="House #, Street #, Sector / Area"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery / Installation Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    value={shippingNotes}
                    onChange={e => setShippingNotes(e.target.value)}
                    placeholder="e.g. Car is parked in basement garage. Please bring 10mm spanner for battery clamp."
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs flex items-center gap-2 shadow"
                  >
                    <span>CONTINUE TO PAYMENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Payment Method Selection & Review */}
            {step === 3 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900">
                    3. Payment Method & Confirmation
                  </h3>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Edit Delivery Info
                  </button>
                </div>

                {/* Payment Option Selection */}
                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label
                    className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-4 transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-red-600 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Cash on Delivery (COD)</span>
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          MOST POPULAR IN ISLAMABAD
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Pay cash directly to our rider/technician upon battery installation. Stamped warranty slip provided on spot.
                      </p>
                    </div>
                  </label>

                  {/* Online Payment (PayFast / Pakistani Gateway / Cards / JazzCash / EasyPaisa) */}
                  <label
                    className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-4 transition-all ${
                      paymentMethod === 'payfast'
                        ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'payfast'}
                      onChange={() => setPaymentMethod('payfast')}
                      className="accent-red-600 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span>Pay Online (Cards / JazzCash / EasyPaisa)</span>
                        </span>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          SECURE GATEWAY
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Pay securely through official Pakistani payment gateway with instantaneous HMAC server verification.
                      </p>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label
                    className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-4 transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="accent-red-600 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-600" />
                          <span>Direct Bank Transfer (Meezan Bank F-10)</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Transfer to Chaudhary Battery And UPS account: Meezan Bank F-10 Markaz (PK42MEZN0000100123456789).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Old Battery Trade-in Commitment */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={oldBatteryTradeIn}
                      onChange={e => setOldBatteryTradeIn(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 mt-0.5 rounded"
                    />
                    <div>
                      <span className="font-bold text-xs text-emerald-950 block">
                        Commit to giving old dead battery for Rs. 500 extra rebate
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        Our technician will take your old battery when installing the new one.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Delivery</span>
                  </button>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-8 rounded-lg text-xs shadow-lg shadow-red-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? 'VERIFYING WITH SERVER...' : 'CONFIRM & PLACE ORDER'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Review Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Order Items ({items.length})
              </h3>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {items.map(it => (
                  <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-900 truncate">{it.productName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Qty: {it.quantity} × Rs. {it.unitPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900 whitespace-nowrap">
                      Rs. {it.subtotal.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">Rs. {subtotal.toLocaleString()}</span>
                </div>

                {scrapDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Old Battery Rebate:</span>
                    <span className="font-mono">-Rs. {scrapDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges:</span>
                  <span className={shippingFee === 0 ? 'text-emerald-700 font-bold' : 'font-mono'}>
                    {shippingFee === 0 ? 'FREE (Islamabad)' : `Rs. ${shippingFee.toLocaleString()}`}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Final Total:</span>
                  <span className="font-mono text-red-600 text-lg">
                    Rs. {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chaudhary Battery Guarantee:</span>
                </div>
                <p>100% Genuine Stamped Battery with Manufacturer Warranty Card & Roadside Assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
