import React from 'react';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Brand } from '../../types';

interface BrandShowcaseProps {
  brands: Brand[];
  onNavigate: (route: string, param?: string) => void;
}

export const BrandShowcase: React.FC<BrandShowcaseProps> = ({ brands, onNavigate }) => {
  const brandSubtitles: Record<string, string> = {
    ags: 'Atlas Battery Ltd (GS Yuasa Japan Technology)',
    daewoo: '100% Maintenance-Free Sealed Korean Tech',
    volta: 'Pakistan Accumulators (Tubular & Platinum)',
    osaka: 'Tubo-Solar & Deep Cycle Inverter Leaders',
    exide: 'Pioneers in Heavy Duty Starting Power Since 1953',
    phoenix: 'Extreme Summer High-Heat Resistant Alloy'
  };

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-red-600 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Authorised Pakistani Brands</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shop Batteries By Brand
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Direct factory distribution with guaranteed fresh stock and official manufacturer warranty slips.
            </p>
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 self-start sm:self-auto group"
          >
            <span>View All Battery Brands</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {brands.map(brand => (
            <div
              key={brand.id}
              onClick={() => onNavigate('brand', brand.slug)}
              className="group bg-slate-50 border border-slate-200 hover:border-red-500 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
            >
              <div className="h-16 flex items-center justify-center mb-3">
                <span className="font-black text-xl tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                  {brand.name}
                </span>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight mb-2">
                  {brandSubtitles[brand.slug] || brand.description}
                </p>

                <div className="text-[11px] font-bold text-slate-700 group-hover:text-red-600 flex items-center justify-center gap-1">
                  <span>Explore Series</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
