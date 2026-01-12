"use client";
import React, { useState, useEffect } from "react";

const Navbar = ({ totalItems, onOpenCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Fungsi untuk memantau posisi scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-100 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#2d241e]/90 backdrop-blur-md border-b border-stone-800 py-3 shadow-lg" 
          : "bg-transparent py-5 border-transparent"
      }`}
    >
      <div className="flex justify-between items-center px-6 md:px-8 max-w-7xl mx-auto">
        {/* Logo - Berubah warna saat scroll */}
        <div className={`text-2xgl font-serif font-bold tracking-tighter transition-colors duration-300 ${
          isScrolled ? "text-white" : "text-white"
        }`}>
          RUANG<span className="text-amber-500">NADI</span>
        </div>

        {/* Desktop Menu Links - Putih saat di Hero, tetap putih saat scroll (karena bg cokelat) */}
        <div className="hidden md:flex gap-8 font-medium text-xs uppercase tracking-[0.2em] text-white/90">
          <a href="#menu" className="hover:text-amber-500 transition-colors">Menu</a>
          <a href="#story" className="hover:text-amber-500 transition-colors">Story</a>
          <a href="#order" className="hover:text-amber-500 transition-colors">Order</a>
        </div>

        {/* Actions (Cart & Mobile Menu) */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenCart}
            className={`px-5 py-2 rounded-full text-xs font-bold shadow-lg transition-all active:scale-95 flex gap-2 items-center ${
              isScrolled 
                ? "bg-amber-600 text-white hover:bg-amber-700" 
                : "bg-white text-[#2d241e] hover:bg-amber-500 hover:text-white"
            }`}
          >
            Cart
            <span className={`text-[10px] rounded-full px-1.5 py-0.5 transition-all duration-300 ${
              totalItems > 0 ? "scale-110 bg-amber-900 text-white" : "scale-100 bg-stone-200 text-stone-600"
            }`}>
              {totalItems}
            </span>
          </button>

          {/* Hamburger Icon */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 transition-colors ${isScrolled ? "text-white" : "text-white"}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#2d241e] border-t border-stone-800 px-6 py-6 flex flex-col gap-5 font-medium uppercase tracking-widest text-xs text-white/90 animate-in fade-in slide-in-from-top-2 duration-300">
          <a href="#menu" onClick={() => setIsOpen(false)} className="hover:text-amber-500 transition-colors">Menu</a>
          <a href="#story" onClick={() => setIsOpen(false)} className="hover:text-amber-500 transition-colors">Story</a>
          <a href="#order" onClick={() => setIsOpen(false)} className="hover:text-amber-500 transition-colors">Order</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;