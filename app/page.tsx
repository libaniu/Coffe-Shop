"use client";

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Story from '@/components/Story'; 
import MenuCard from '@/components/MenuCard';
import CartSidebar from '@/components/CartSidebar';
import Footer from '@/components/Footer';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk Custom Dropdown
  const [sortBy, setSortBy] = useState("default");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: menuList, error, isLoading } = useSWR("/api/menu", fetcher, {
    revalidateOnFocus: true, 
    refreshInterval: 30000, 
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = ["All", "Coffee", "Non-Coffee", "Pastry", "Food"];

  // Konfigurasi Opsi Sort dengan Ikon/Indikator
  const sortOptions = [
    { label: "Urutan Default", value: "default", icon: "📋" },
    { label: "Nama: A - Z", value: "name-asc", icon: "AZ ↓" },
    { label: "Nama: Z - A", value: "name-desc", icon: "ZA ↑" },
    { label: "Harga: Terendah", value: "price-low", icon: "Rp ↑" },
    { label: "Harga: Tertinggi", value: "price-high", icon: "Rp ↓" },
  ];

  const filteredAndSortedMenu = (menuList || [])
    .filter((item: any) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0;
    });

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) return prev.map((i) => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <Navbar totalItems={cart.reduce((acc, item) => acc + item.qty, 0)} onOpenCart={() => setIsCartOpen(true)} />
      <Hero />
      <Story /> 

      <section id="menu" className="py-20 px-8 container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-[#2d241e] mb-4">Menu Kami</h2>
          <div className="w-20 h-1 bg-amber-600 mx-auto mb-10"></div>

          {/* Search & Custom Sort */}
          <div className="max-w-2xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-center relative">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Cari Menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-full border border-stone-200 focus:border-amber-600 outline-none text-sm shadow-sm transition-all"
              />
              <span className="absolute right-6 top-4 text-stone-300">🔍</span>
            </div>

            {/* CUSTOM DROPDOWN DENGAN IKON */}
            <div className="relative w-full md:w-72" ref={dropdownRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full px-6 py-4 rounded-full border border-stone-200 bg-white text-stone-600 text-sm font-bold flex justify-between items-center hover:border-amber-600 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-amber-600 text-[10px] font-black">{sortOptions.find(opt => opt.value === sortBy)?.icon}</span>
                  <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                </div>
                <span className={`text-[10px] transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {isSortOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-stone-100 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-8 py-5 text-left text-sm transition-all flex justify-between items-center border-b border-stone-50 last:border-none
                        ${sortBy === option.value ? 'bg-amber-50 text-amber-900' : 'text-stone-500 hover:bg-stone-50'}
                      `}
                    >
                      <span className={sortBy === option.value ? "font-black" : "font-medium"}>{option.label}</span>
                      <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">{option.icon}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tab Kategori */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all border ${activeCategory === cat ? "bg-[#2d241e] text-white border-[#2d241e] shadow-md" : "bg-white text-stone-500 border-stone-200 hover:border-amber-600"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* Konten Menu / Skeleton Loader (Sama seperti sebelumnya) */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] border border-stone-100 p-6 animate-pulse">
                <div className="aspect-square bg-stone-100 rounded-3xl mb-6" />
                <div className="h-6 bg-stone-200 rounded-md w-3/4 mb-4" />
                <div className="h-4 bg-stone-100 rounded-md w-1/2 mb-8" />
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-stone-200 rounded-md w-1/4" />
                  <div className="h-10 bg-stone-100 rounded-full w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {filteredAndSortedMenu.map((item: any) => (
              <MenuCard key={item._id} item={item} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </section>

      <Footer />
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart}
        onAdd={addToCart}
        onSubtract={(id: any) => setCart(prev => prev.map(i => i._id === id ? {...i, qty: i.qty - 1} : i).filter(i => i.qty > 0))}
        onRemove={(id: any) => setCart(prev => prev.filter(i => i._id !== id))}
      />
    </main>
  );
}