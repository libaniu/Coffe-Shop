"use client";
import React, { useState } from 'react';

const MenuCard = ({ item, onAddToCart }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // --- 1. STATE UNTUK VARIAN YANG DIPILIH ---
  // Secara default memilih varian pertama (biasanya Hot atau Medium)
  const [selectedVariant, setSelectedVariant] = useState(item.variants?.[0] || null);

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
    <div className="group bg-white p-5 rounded-[2.5rem] shadow-sm border border-stone-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-[#2d241e] flex flex-col">
      
      {/* Container Gambar & Badge Kategori */}
      <div className="h-72 bg-stone-200 rounded-4xl mb-6 overflow-hidden relative shrink-0">
        <span className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-800">
          {item.category}
        </span>
        
        <img 
          src={item.img}
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>

      <div className="px-2 flex-1 flex flex-col">
        {/* Nama Menu & Harga Dinamis */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold font-serif">{item.name}</h3>
          <span className="text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded-lg text-sm shrink-0 ml-2">
            {/* Harga berubah otomatis mengikuti pilihan variant */}
            Rp {selectedVariant?.price.toLocaleString("id-ID")}
          </span>
        </div>
        
        <p className="text-stone-400 text-sm mb-4 leading-relaxed line-clamp-2">
          {item.desc}
        </p>

        {/* --- 3. UI PEMILIH VARIAN (HOT / ICED) --- */}
        {item.variants && item.variants.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {item.variants.map((variant, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border
                  ${selectedVariant?.label === variant.label 
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm' 
                    : 'bg-stone-50 border-stone-100 text-stone-400 hover:border-stone-200'
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
          className={`w-full py-4 rounded-2xl font-bold transition-all mt-auto shadow-lg 
            ${item.isAvailable 
              ? 'bg-[#2d241e] text-white hover:bg-amber-800 active:scale-95' 
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            } 
            ${isAnimating ? 'animate-push' : ''}`}
        >
          {item.isAvailable ? (isAnimating ? 'Added! ✓' : 'Add To Cart') : 'Sold Out'}
        </button>
      </div>
    </div>
  );
};

export default MenuCard;