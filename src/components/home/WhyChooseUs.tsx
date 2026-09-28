import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Wrench, Award, PhoneCall } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const points = [
    {
      icon: ShieldCheck,
      title: '100% Genuine Stamped Stock',
      desc: 'No duplicate, refurbished, or low-acid batteries. Every battery carries an original serial barcode and our authorized F-10 dealer seal.'
    },
    {
      icon: Truck,
      title: 'Rapid 45-Min Mobile Fitting',
      desc: 'Stranded on the road or at home in Islamabad? Our mobile technicians arrive on a bike or van with replacement battery and terminal grease.'
    },
    {
      icon: Wrench,
      title: 'Free Computerized Diagnostic',
      desc: 'Before replacing your battery, we test your vehicle alternator charging voltage, starter motor draw, and acid specific gravity.'
    },
    {
      icon: RotateCcw,
      title: 'Old Battery Scrap Rebate',
      desc: 'Get fair market cash discount on your old dead battery. We ensure eco-friendly, certified lead recycling.'
    },
    {
      icon: Award,
      title: 'Hassle-Free Warranty Claims',
      desc: 'We handle official warranty claims on the spot at our F-10 Markaz shop with instant load tester verification.'
    },
    {
      icon: PhoneCall,
      title: 'Solar & Inverter Advisory',
      desc: 'Expert sizing for home solar systems (Inverex, Crown, SolarMax) to ensure maximum backup hours without inverter error codes.'
    }
  ];

  return (
    <section className="py-16 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-red-500 font-bold text-xs uppercase tracking-wider mb-2">
            Why Islamabad Chooses Us
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            The Chaudhary Battery & UPS F-10 Standard
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Serving motorists, homeowners, and commercial establishments across Islamabad and Rawalpindi with integrity and technical excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-red-600/15 border border-red-500/20 text-red-500 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
