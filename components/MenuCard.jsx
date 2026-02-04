"use client";
import React, { useState } from "react";
import { Plus, Check, ShoppingCart } from "lucide-react";

const MenuCard = ({ item, onAddToCart }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // --- 1. STATE UNTUK VARIAN YANG DIPILIH ---
  // Secara default memilih varian pertama (biasanya Hot atau Medium)
  const [selectedVariant, setSelectedVariant] = useState(
    item.variants?.[0] || null,
  );

  const handleAdd = () => {
    // Validasi ketersediaan stok dan pilihan varian
    if (!item.isAvailable || !selectedVariant) return;

    setIsAnimating(true);

    // --- 2. MENGIRIM DATA VARIAN KE PARENT ---
    // Mengirim objek varian terpilih ke fungsi addToCart di page.tsx
    onAddToCart(selectedVariant);

    // Reset animasi setelah 800ms
    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <div className="group bg-white p-4 rounded-3xl shadow-md border border-stone-100/50 hover:shadow-xl hover:border-amber-100/50 hover:-translate-y-1 transition-all duration-300 text-[#2d241e] flex flex-col h-full relative">
      {/* Container Gambar & Badge Kategori */}
      <div className="h-60 bg-stone-200 rounded-2xl mb-5 overflow-hidden relative shrink-0 shadow-inner">
        <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-800 shadow-sm">
          {item.category}
        </span>

        <img
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        {/* Overlay Gradient Halus */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="px-1 flex-1 flex flex-col">
        {/* Nama Menu & Harga Dinamis */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-serif font-bold leading-tight text-stone-800 group-hover:text-amber-700 transition-colors">
            {item.name}
          </h3>
          <div className="flex flex-col items-end shrink-0 ml-2">
            <span className="text-amber-700 font-black text-sm">
              Rp {selectedVariant?.price.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <p className="text-stone-500 text-xs mb-5 leading-relaxed line-clamp-2 font-light">
          {item.desc}
        </p>

        {/* --- 3. UI PEMILIH VARIAN (HOT / ICED) --- */}
        {item.variants && item.variants.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 mt-auto w-full">
            {item.variants.map((variant, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border text-center
                  ${
                    selectedVariant?.label === variant.label
                      ? "bg-[#2d241e] border-[#2d241e] text-white shadow-md transform scale-105"
                      : "bg-stone-50 border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-700"
                  }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        )}

        {/* Tombol Add To Cart dengan Animasi Feedback */}
        <button
          onClick={handleAdd}
          disabled={!item.isAvailable}
          className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all mt-auto shadow-md flex items-center justify-center gap-2
            ${
              item.isAvailable
                ? "bg-amber-600 text-white hover:bg-amber-700 active:scale-95 hover:shadow-lg"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            } 
            ${isAnimating ? "animate-push" : ""}`}
        >
          {item.isAvailable ? (
            isAnimating ? (
              <>
                Added <Check size={14} strokeWidth={3} />
              </>
            ) : (
              <>
                Add To Cart <ShoppingCart size={14} strokeWidth={3} />
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
