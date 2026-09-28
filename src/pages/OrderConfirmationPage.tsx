import React, { useState, useEffect } from 'react';
import { CheckCircle2, Package, Printer, ArrowRight, ShieldCheck, Phone, MapPin, Zap } from 'lucide-react';
import { Order } from '../types';
import { InvoiceModal } from '../components/common/InvoiceModal';

interface OrderConfirmationPageProps {
  orderId: string;
  onNavigate: (route: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.order) {
          setOrder(d.order);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-sm">Retrieving your order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">Could not load order details.</p>
        <button
          onClick={() => onNavigate('home')}
          className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs"
        >
          GO TO HOMEPAGE
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2 inline-block">
            Order Placed Successfully
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Shukriya! Your Order is Confirmed
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
            We have received your battery order <strong className="text-slate-900">#{order.order_number}</strong>. Our F-10 Markaz technical team has begun preparation and diagnostic testing.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Number:</span>
              <span className="font-mono font-bold text-slate-900">#{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer Name:</span>
              <span className="font-bold text-slate-900">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-bold uppercase text-slate-900">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className={`font-bold uppercase ${order.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
              <span className="font-bold text-slate-900">Total Amount:</span>
              <span className="font-mono font-black text-red-600">
                Rs. {Number(order.total_amount).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowInvoice(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-lg text-xs flex items-center gap-2 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT TAX INVOICE & RECEIPT</span>
            </button>

            <button
              onClick={() => onNavigate('track-order', order.order_number)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg text-xs flex items-center gap-2 shadow"
            >
              <Package className="w-4 h-4" />
              <span>TRACK ORDER TIMELINE</span>
            </button>
          </div>
        </div>

        {/* Delivery & Warranty Instructions Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs text-slate-700">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Important Information For Delivery:</span>
          </h3>

          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Roadside Mobile Van:</strong> In Islamabad, our mobile technician will call on your registered phone ({order.customer_phone}) before arriving.
            </li>
            <li>
              <strong>Stamped Warranty Card:</strong> The physical official manufacturer warranty slip stamped by Chaudhary Battery And UPS F10 will be handed to you upon delivery.
            </li>
            <li>
              <strong>Old Battery Trade-in:</strong> If you selected old scrap battery rebate, please keep your old battery ready to give to the driver.
            </li>
          </ul>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
            <span>Shop # 14-16, Capital Trade Centre, F-10 Markaz Islamabad</span>
            <span>Helpline: +92 51 2212345</span>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {showInvoice && (
        <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};
