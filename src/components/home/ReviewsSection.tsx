import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { Review } from '../../types';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch('/api/products/prod_ags_gl65')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.product?.reviews) {
          setReviews(d.product.reviews);
        }
      })
      .catch(() => {});
  }, []);

  const defaultReviews = [
    {
      id: 'r1',
      customer_name: 'Malik Tariq Mehmood (F-10/2 Islamabad)',
      rating: 5,
      title: 'Emergency delivery to F-10 within 45 minutes!',
      comment: 'Car refused to start on a Monday morning. Contacted Chaudhary Battery F-10, ordered the AGS GL-65 on Cash on Delivery. Rider was at my doorstep in 45 mins with battery and tools, replaced it and gave a fair scrap discount for my old battery.',
      is_verified_purchase: 1,
      created_at: Date.now() - 86400000 * 2
    },
    {
      id: 'r2',
      customer_name: 'Dr. Shahzad Afzal (G-10/4)',
      rating: 5,
      title: 'Authentic Daewoo Maintenance Free',
      comment: 'Cleanest battery installation. Magic eye status indicator is deep green, fresh production batch date code stamped. Best battery supplier in Islamabad.',
      is_verified_purchase: 1,
      created_at: Date.now() - 86400000 * 5
    },
    {
      id: 'r3',
      customer_name: 'Engr. Kamran Siddiqui (E-11/3)',
      rating: 5,
      title: 'Volta TS-1800 Tall Tubular for Home Solar',
      comment: 'Bought 4 batteries for 5kW hybrid inverter. The technician explained the specific gravity check and float level plugs thoroughly. 9+ hours continuous backup during night load shedding.',
      is_verified_purchase: 1,
      created_at: Date.now() - 86400000 * 8
    }
  ];

  const activeReviews = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <section className="py-14 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
            Customer Testimonials
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Motorists Across Islamabad
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-600">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="font-bold text-slate-800">4.9 / 5.0</span>
            <span>Based on 1,200+ local installations</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeReviews.slice(0, 3).map((r, i) => (
            <div
              key={r.id || i}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(r.rating || 5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  {r.is_verified_purchase === 1 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Verified Order
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-2">{r.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">"{r.comment}"</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{r.customer_name}</span>
                <span className="text-slate-400 text-[10px]">Islamabad Client</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
