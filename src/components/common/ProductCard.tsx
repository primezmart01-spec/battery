import React, { useState } from 'react';
import { ShoppingCart, Heart, Scale, ShieldCheck, Zap, Check, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useCompare } from '../../context/CompareContext';
import { useAuth } from '../../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (route: string, param?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart } = useCart();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { user } = useAuth();

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const price = product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const inCompare = isInCompare(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    const res = await addToCart(product.id, undefined, 1);
    setIsAdding(false);

    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product.id);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onNavigate('login');
      return;
    }
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      });
      const data = await res.json();
      if (data.success) {
        setIsWishlisted(data.added);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      onClick={() => onNavigate('product', product.slug)}
      className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Badges Bar */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {hasDiscount && (
          <span className="bg-red-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded shadow-sm">
            SAVE {discountPercent}%
          </span>
        )}
        {product.is_bestseller === 1 && (
          <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded tracking-wide">
            POPULAR
          </span>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleToggleWishlist}
          title="Save to Wishlist"
          className={`p-2 rounded-full shadow-md backdrop-blur-sm transition-colors ${
            isWishlisted
              ? 'bg-red-50 text-red-600'
              : 'bg-white/90 text-slate-600 hover:text-red-600 hover:bg-white'
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>

        <button
          onClick={handleToggleCompare}
          title={inCompare ? 'Remove from comparison' : 'Compare battery'}
          className={`p-2 rounded-full shadow-md backdrop-blur-sm transition-colors ${
            inCompare
              ? 'bg-blue-600 text-white'
              : 'bg-white/90 text-slate-600 hover:text-blue-600 hover:bg-white'
          }`}
          aria-label="Compare battery"
        >
          <Scale className="w-4 h-4" />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative w-full pt-[80%] bg-gradient-to-b from-slate-50 to-white overflow-hidden border-b border-slate-100 flex items-center justify-center">
        <img
          src={product.primary_image || '/uploads/battery_ags_gl65.jpg'}
          alt={product.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/uploads/battery_ags_gl65.jpg';
          }}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded border border-slate-700">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & SKU */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold text-red-600 tracking-wide uppercase">{product.brand_name}</span>
            <span className="font-mono text-slate-400">SKU: {product.sku}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug line-clamp-2 group-hover:text-red-600 transition-colors mb-2">
            {product.name}
          </h3>

          {/* Technical Specs Tags */}
          <div className="flex items-center gap-2 flex-wrap mb-3 text-xs">
            <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded font-mono">
              {product.ah_capacity}Ah
            </span>
            <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded font-mono">
              {product.voltage}
            </span>
            <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {product.warranty_months}M Warranty
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-500">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.avg_rating || 5)
                      ? 'fill-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-slate-700">{product.avg_rating || '5.0'}</span>
            <span>({product.reviews_count || 1})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg md:text-xl font-extrabold text-slate-900 font-mono">
              Rs. {price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through font-mono">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock state */}
          <div className="text-[11px] mb-2 font-medium">
            {isOutOfStock ? (
              <span className="text-rose-600 font-semibold">Out of Stock</span>
            ) : isLowStock ? (
              <span className="text-amber-600 font-semibold">Only {product.stock_quantity} left in stock</span>
            ) : (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                In Stock · Ready for F-10 Dispatch
              </span>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : justAdded
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-red-600/20 active:scale-[0.98]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>ADDED TO CART</span>
              </>
            ) : isAdding ? (
              <span>ADDING...</span>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>ADD TO CART</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
