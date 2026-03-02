"use client";
import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  totalItems: number;
  onOpenCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ totalItems, onOpenCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Click Outside untuk menutup menu mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 w-full z-100 transition-all duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled
          ? "bg-[#2d241e]/90 backdrop-blur-md border-b border-stone-800 py-3 shadow-lg"
          : "bg-transparent py-5 border-transparent"
      }`}
    >
      <div className="flex justify-between items-center px-6 md:px-8 max-w-7xl mx-auto">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`text-2xl font-serif font-bold tracking-tighter transition-colors duration-300 cursor-pointer ${
            isScrolled ? "text-white" : "text-white"
          }`}
        >
          RUANG<span className="text-amber-800">NADI</span>
        </button>

        <div className="hidden md:flex gap-8 font-medium text-xs uppercase tracking-[0.2em] text-white/90">
          <a href="#menu" className="hover:text-amber-500 transition-colors">
            Menu
          </a>
          <a href="#story" className="hover:text-amber-500 transition-colors">
            Story
          </a>
          <a href="#order" className="hover:text-amber-500 transition-colors">
            Order
          </a>
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
            <span
              className={`text-[10px] rounded-full px-1.5 py-0.5 transition-all duration-300 ${
                totalItems > 0
                  ? "scale-110 bg-amber-900 text-white"
                  : "scale-100 bg-stone-200 text-stone-600"
              }`}
            >
              {totalItems}
            </span>
          </button>

          <button
            className={`md:hidden p-2 rounded-full transition-all duration-500 ${
              isOpen
                ? "bg-stone-800 text-amber-500 rotate-180 shadow-md"
                : "text-white hover:bg-white/10"
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden bg-[#2d241e] overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-96 opacity-100 border-t border-stone-800"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-6 flex flex-col gap-5 font-medium uppercase tracking-widest text-xs text-white/90">
          <a
            href="#menu"
            onClick={() => setIsOpen(false)}
            className="hover:text-amber-500 transition-colors"
          >
            Menu
          </a>
          <a
            href="#story"
            onClick={() => setIsOpen(false)}
            className="hover:text-amber-500 transition-colors"
          >
            Story
          </a>
          <a
            href="#order"
            onClick={() => setIsOpen(false)}
            className="hover:text-amber-500 transition-colors"
          >
            Order
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
