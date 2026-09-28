import React, { useState, useEffect } from 'react';
import { Package, Search, CheckCircle2, Clock, Truck, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingPageProps {
  initialOrderNumber?: string;
  onNavigate: (route: string, param?: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialOrderNumber, onNavigate }) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber || '');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (num: string, contact: string) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: num.trim(),
          phoneOrEmail: contact.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTrackingData(data.tracking);
      } else {
        setError(data.error || 'No matching order found.');
        setTrackingData(null);
      }
    } catch {
      setError('Connection error while tracking order.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phoneOrEmail) {
      setError('Please provide both Order Number and Phone/Email.');
      return;
    }
    fetchTracking(orderNumber, phoneOrEmail);
  };

  const statuses = [
    { key: 'pending', label: 'Order Placed', desc: 'Order received by F-10 store' },
    { key: 'confirmed', label: 'Payment Confirmed', desc: 'Payment or COD verified' },
    { key: 'processing', label: 'Testing & Diagnostic', desc: 'Battery voltage & acid load tested' },
    { key: 'packed', label: 'Packed with Warranty', desc: 'Stamped warranty card attached' },
    { key: 'shipped', label: 'Out for Roadside Delivery', desc: 'Technician on mobile van' },
    { key: 'delivered', label: 'Delivered & Fitted', desc: 'Installed in vehicle with terminal grease' }
  ];

  const getStatusIndex = (currentStatus: string) => {
    const map: Record<string, number> = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      packed: 3,
      shipped: 4,
      out_for_delivery: 4,
      delivered: 5
    };
    return map[currentStatus] ?? 0;
  };

  const currentStep = trackingData ? getStatusIndex(trackingData.order_status) : 0;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 p-2 bg-red-100 text-red-600 rounded-full mb-3">
            <Package className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Track Battery Delivery Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time live progress for Islamabad mobile battery van dispatches and nationwide freight.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-10">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Order Number</label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                placeholder="e.g. CBF10-2026-1234"
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-mono uppercase focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone or Email</label>
              <input
                type="text"
                required
                value={phoneOrEmail}
                onChange={e => setPhoneOrEmail(e.target.value)}
                placeholder="Registered phone or email"
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow"
              >
                <Search className="w-4 h-4" />
                <span>{isLoading ? 'SEARCHING...' : 'TRACK ORDER'}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tracking Timeline Output */}
        {trackingData && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Order Reference
                  </span>
                  <h3 className="font-mono text-xl font-black text-slate-900">
                    #{trackingData.order_number}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Customer: <strong className="text-slate-800">{trackingData.customer_name}</strong>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Status
                  </span>
                  <span className="inline-block px-3 py-1 bg-red-50 text-red-700 font-extrabold text-xs uppercase rounded-full mt-1">
                    {trackingData.order_status.replace(/_/g, ' ')}
                  </span>
                  {trackingData.tracking_number && (
                    <div className="text-xs font-mono text-slate-600 mt-1">
                      Van / Courier Tracking: <strong>{trackingData.tracking_number}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Steps Timeline */}
              <div className="py-8">
                <div className="relative">
                  <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                    {statuses.map((s, idx) => {
                      const isComplete = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={s.key} className="flex flex-col items-center text-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-2 ${
                              isComplete
                                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <div className={`font-bold text-xs ${isCurrent ? 'text-red-600' : isComplete ? 'text-slate-900' : 'text-slate-400'}`}>
                            {s.label}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 max-w-[100px] leading-tight hidden sm:block">
                            {s.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Status History Logs */}
              {trackingData.timeline && trackingData.timeline.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
                    Recent Status Updates
                  </h4>
                  <div className="space-y-2">
                    {trackingData.timeline.map((entry: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-800 uppercase">{entry.status}</span>
                          <span className="text-slate-500"> — {entry.notes || 'Status changed'}</span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(entry.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
