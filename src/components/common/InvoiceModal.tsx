import React, { useRef } from 'react';
import { X, Printer, Download, ShieldCheck, Zap } from 'lucide-react';
import { Order } from '../../types';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Controls */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-500" />
            <span className="font-bold text-sm">Official Tax Invoice & Warranty Slip</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div ref={printRef} className="p-8 overflow-y-auto print:p-0 text-slate-800 text-xs">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-red-600 text-white rounded flex items-center justify-center font-black text-sm">
                  ⚡
                </div>
                <span className="font-black text-lg text-slate-900 tracking-tight">CHAUDHARY BATTERY AND UPS</span>
              </div>
              <p className="text-slate-500 max-w-sm text-[11px] leading-relaxed">
                Shop # 14-16, Ground Floor, Capital Trade Centre, F-10 Markaz, Islamabad, 44000, Pakistan<br/>
                Phone: +92 51 2212345 · WhatsApp: +92 300 5551234 · sales@chaudharybattery.pk<br/>
                <strong>NTN:</strong> 7321094-1 · <strong>STRN:</strong> 3277876123409
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-red-50 text-red-700 border border-red-200 font-extrabold text-sm uppercase rounded mb-2">
                ORIGINAL INVOICE
              </span>
              <div className="font-mono text-sm font-bold text-slate-900">
                #{order.order_number}
              </div>
              <div className="text-slate-500 text-[11px]">
                Date: {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Customer & Order Metadata */}
          <div className="grid grid-cols-2 gap-6 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
                Billed & Shipped To:
              </span>
              <div className="font-bold text-slate-900 text-sm">{order.customer_name}</div>
              <div className="text-slate-600">{order.customer_phone}</div>
              <div className="text-slate-600">{order.customer_email}</div>
              {order.shippingAddress && (
                <div className="text-slate-600 mt-1">
                  {order.shippingAddress.address_line1}, {order.shippingAddress.city}, {order.shippingAddress.province}
                </div>
              )}
            </div>

            <div className="space-y-1 text-right">
              <div>
                <span className="text-slate-500">Payment Method:</span>{' '}
                <span className="font-bold text-slate-900 uppercase">{order.payment_method}</span>
              </div>
              <div>
                <span className="text-slate-500">Payment Status:</span>{' '}
                <span className={`font-bold uppercase ${order.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {order.payment_status}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Order Status:</span>{' '}
                <span className="font-bold text-slate-900 uppercase">{order.order_status}</span>
              </div>
              {order.tracking_number && (
                <div>
                  <span className="text-slate-500">Tracking Reference:</span>{' '}
                  <span className="font-mono font-bold text-slate-900">{order.tracking_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left border-collapse mb-6">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Specs</th>
                <th className="py-2.5 px-3">Warranty</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(order.items || []).map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {it.product_title}
                    <div className="text-[10px] text-slate-400 font-mono">SKU: {it.sku}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    {it.ah_capacity ? `${it.ah_capacity}Ah` : '-'} · {it.voltage || '12V'}
                  </td>
                  <td className="py-3 px-3 text-emerald-700 font-bold text-[11px]">
                    {it.warranty_months ? `${it.warranty_months} Months` : '12 Months'}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">{it.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono">Rs. {Number(it.unit_price).toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    Rs. {Number(it.subtotal_price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculations Summary */}
          <div className="flex justify-between items-start pt-2 border-t border-slate-200 mb-8">
            <div className="max-w-xs text-[11px] text-slate-500">
              <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized Stamped Warranty Guarantee</span>
              </div>
              <p>
                Every battery carries an authentic manufacturer barcode and stamped warranty slip. In case of issues, present this receipt at Chaudhary Battery F-10 Markaz or any authorized AGS, Daewoo, Volta, or Exide service centre nationwide.
              </p>
            </div>

            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">Rs. {Number(order.subtotal).toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Rebate / Discount:</span>
                  <span className="font-mono">-Rs. {Number(order.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges:</span>
                <span className="font-mono">
                  {order.shipping_amount === 0 ? 'FREE' : `Rs. ${Number(order.shipping_amount).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t-2 border-slate-900 pt-2 mt-2">
                <span>Grand Total:</span>
                <span className="font-mono text-red-600">
                  Rs. {Number(order.total_amount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Verification */}
          <div className="grid grid-cols-2 gap-12 pt-8 border-t border-dashed border-slate-300 text-center text-[11px] text-slate-500">
            <div>
              <div className="h-10 border-b border-slate-400 mb-1"></div>
              <span>Customer Signature & Acknowledgment</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mb-1 flex items-center justify-center font-bold text-red-700 font-serif italic">
                Chaudhary Battery And UPS F10
              </div>
              <span>Authorised Dealer Stamp & Sign</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
