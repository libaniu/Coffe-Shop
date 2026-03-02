"use client";
import React, { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";

interface Variant {
  label: string;
  price: number;
}

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  desc: string;
  img: string;
  isAvailable: boolean;
  variants?: Variant[];
}

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (variant: Variant) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    item.variants?.[0] || null,
  );

  // --- FUNGSI HANDLER GAMBAR ERROR (PENTING) ---
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src =
      "https://placehold.co/600x600/e2e8f0/475569?text=No+Image";
    e.currentTarget.onerror = null;
  };

  const handleAdd = () => {
    if (!item.isAvailable || !selectedVariant) return;

    setIsAnimating(true);

    onAddToCart(selectedVariant);

    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <div className="group bg-white p-3 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-amber-100/50 hover:-translate-y-2 transition-all duration-500 text-[#2d241e] flex flex-col h-full relative">
      <div className="h-72 sm:h-80 bg-stone-200 rounded-3xl mb-5 overflow-hidden relative shrink-0 shadow-sm group-hover:shadow-md transition-all">
        <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-800 shadow-sm">
          {item.category}
        </span>

        <img
          src={item.img}
          alt={item.name}
          onError={handleImageError}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="px-2 pb-2 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif font-bold leading-tight text-stone-800 group-hover:text-amber-700 transition-colors">
            {item.name}
          </h3>
          <div className="flex flex-col items-end shrink-0 ml-2">
            <span className="text-amber-700 font-black text-lg">
              Rp {selectedVariant?.price.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <p className="text-stone-500 text-sm mb-6 leading-relaxed line-clamp-2 font-light">
          {item.desc}
        </p>

        {/* --- UI PEMILIH VARIAN --- */}
        {item.variants && item.variants.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6 mt-auto w-full">
            {item.variants.map((variant, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                disabled={!item.isAvailable}
                className={`flex-1 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border text-center
                  ${
                    selectedVariant?.label === variant.label
                      ? "bg-[#2d241e] border-[#2d241e] text-white shadow-md transform scale-105"
                      : "bg-stone-50 border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-700"
                  } ${!item.isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-auto mb-6"></div>
        )}

        <button
          onClick={handleAdd}
          disabled={!item.isAvailable}
          className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-900/10 flex items-center justify-center gap-2
            ${
              item.isAvailable
                ? "bg-amber-600 text-white hover:bg-amber-700 active:scale-95 hover:shadow-lg"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            } 
            ${isAnimating ? "scale-95 bg-emerald-600 hover:bg-emerald-600" : ""}`}
        >
          {item.isAvailable ? (
            isAnimating ? (
              <>
                Added <Check size={16} strokeWidth={3} />
              </>
            ) : (
              <>
                Add To Cart <ShoppingCart size={16} strokeWidth={3} />
              </>
            )
          ) : (
            "Sold Out"
          )}
        </button>
      </div>
    </div>
  );
};

export default MenuCard;
