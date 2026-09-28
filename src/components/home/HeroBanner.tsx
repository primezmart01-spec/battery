import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Zap, Truck, RotateCcw, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { Banner } from '../../types';

interface HeroBannerProps {
  onNavigate: (route: string, param?: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onNavigate }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/api/cms/banners')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.banners?.length > 0) {
          setBanners(d.banners);
        }
      })
      .catch(() => {});
  }, []);

  const defaultBanners: Banner[] = [
    {
      id: 'b1',
      title: 'Reliable Batteries. Powerful Performance.',
      subtitle: 'Shop genuine automotive, solar, and UPS batteries from Pakistan’s trusted brands including AGS, Daewoo, Volta, Osaka, Exide, and Phoenix in F-10 Markaz Islamabad.',
      image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1600&q=80',
      cta_text: 'Shop Batteries',
      cta_link: 'shop',
      display_order: 1
    },
    {
      id: 'b2',
      title: 'Heavy Duty Solar Tubular Batteries with Long Backup',
      subtitle: 'Tall tubular Volta TS & Osaka Tubo-Solar deep cycle series designed for frequent Pakistani load-shedding and hybrid solar inverters.',
      image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1600&q=80',
      cta_text: 'Explore Tubular & Solar',
      cta_link: 'tubular',
      display_order: 2
    },
    {
      id: 'b3',
      title: '100% Sealed Maintenance-Free Daewoo Batteries',
      subtitle: 'Zero acid filling or water topping required. Magic Eye state-of-charge indicator and rapid roadside battery delivery in Islamabad.',
      image_url: 'https://images.unsplash.com/photo-1558441719-8b459c86f6c0?auto=format&fit=crop&w=1600&q=80',
      cta_text: 'Shop Daewoo Range',
      cta_link: 'daewoo',
      display_order: 3
    }
  ];

  const activeBanners = banners.length > 0 ? banners : defaultBanners;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const slide = activeBanners[currentSlide];

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
      {/* Background Image Carousel */}
      <div className="relative min-h-[460px] md:min-h-[520px] flex items-center">
        {activeBanners.map((b, idx) => (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={b.image_url}
              alt=""
              className="w-full h-full object-cover opacity-25 filter brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
          </div>
        ))}

        {/* Slide Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 w-full z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/40 rounded-full text-red-400 text-xs font-bold tracking-wide uppercase mb-4 animate-in fade-in duration-500">
              <Zap className="w-3.5 h-3.5 text-red-500" />
              <span>Chaudhary Battery And UPS · F-10 Markaz Islamabad</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4">
              {slide.title}
            </h1>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-8 max-w-xl">
              {slide.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('shop')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-lg text-sm flex items-center gap-2 shadow-xl shadow-red-600/30 transition-all active:scale-95"
              >
                <span>SHOP BATTERIES</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('shop', 'brands')}
                className="bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold py-3.5 px-6 rounded-lg text-sm border border-slate-700 transition-colors"
              >
                BROWSE BRANDS
              </button>

              <a
                href="tel:+92512212345"
                className="hidden sm:flex items-center gap-2 text-slate-300 hover:text-white text-xs font-semibold py-3 px-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-red-500">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Emergency Helpline</div>
                  <div className="font-bold">+92 51 2212345</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + activeBanners.length) % activeBanners.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white backdrop-blur-sm border border-slate-700 transition-colors"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % activeBanners.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white backdrop-blur-sm border border-slate-700 transition-colors"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Trust Highlights Strip below Hero */}
      <div className="bg-slate-900 border-t border-slate-800 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-white font-bold">100% Stamped Warranty</div>
              <div className="text-[11px] text-slate-400">Official manufacturer cards</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-white font-bold">45-Min Emergency Delivery</div>
              <div className="text-[11px] text-slate-400">Mobile fitting van in ICT</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-white font-bold">Old Battery Scrap Rebate</div>
              <div className="text-[11px] text-slate-400">Instant cash discount</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <div className="text-white font-bold">Free Alternator & Load Test</div>
              <div className="text-[11px] text-slate-400">Computerized battery diagnostic</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
