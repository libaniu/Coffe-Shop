"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Story from "@/components/Story";
import MenuCard from "@/components/MenuCard";
import CartSidebar from "@/components/CartSidebar";
import Footer from "@/components/Footer";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState("default");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- PAGINATION STATE (BARU) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Tampilkan 9 menu per halaman

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const triggerToast = (message: string, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const {
    data: menuList,
    error,
    isLoading,
  } = useSWR("/api/menu", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 30000,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- RESET HALAMAN JIKA FILTER BERUBAH (BARU) ---
  // Kalau user ganti kategori atau cari menu, kembalikan ke halaman 1
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, sortBy]);

  const categories = ["All", "Coffee", "Non-Coffee", "Pastry", "Food"];

  const sortOptions = [
    { label: "Urutan Default", value: "default", icon: "📋" },
    { label: "Nama: A - Z", value: "name-asc", icon: "AZ ↓" },
    { label: "Nama: Z - A", value: "name-desc", icon: "ZA ↑" },
    { label: "Harga: Terendah", value: "price-low", icon: "Rp ↑" },
    { label: "Harga: Tertinggi", value: "price-high", icon: "Rp ↓" },
  ];

  // 1. FILTER & SORT DATA DULU
  const filteredAndSortedMenu = (menuList || [])
    .filter((item: any) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a: any, b: any) => {
      const priceA = a.variants?.[0]?.price || 0;
      const priceB = b.variants?.[0]?.price || 0;

      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      return 0;
    });

  // --- PAGINATION LOGIC (BARU) ---
  // 2. HITUNG INDEKS DATA UNTUK HALAMAN SAAT INI
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // 3. AMBIL DATA YANG AKAN DITAMPILKAN SAJA (SLICE)
  const currentItems = filteredAndSortedMenu.slice(indexOfFirstItem, indexOfLastItem);
  
  // 4. HITUNG TOTAL HALAMAN
  const totalPages = Math.ceil(filteredAndSortedMenu.length / itemsPerPage);

  const addToCart = (item: any, selectedVariant: any) => {
    const cartItemId = `${item._id}-${selectedVariant.label}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === cartItemId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          cartItemId,
          price: selectedVariant.price,
          selectedVariant: selectedVariant.label,
          qty: 1,
        },
      ];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] relative">
      {/* Toast Notification */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] transition-all duration-300 ${
          toast.show
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <div
          className={`flex items-center gap-3 px-8 py-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2 ${
            toast.type === "success"
              ? "bg-white border-emerald-500 text-emerald-800"
              : toast.type === "warning"
              ? "bg-white border-amber-500 text-amber-800"
              : "bg-white border-rose-500 text-rose-800"
          }`}
        >
          <span className="text-3xl">
            {toast.type === "success" ? "✅" : toast.type === "warning" ? "⏳" : "❌"}
          </span>
          <div className="flex flex-col">
            <span className="font-bold text-lg">
              {toast.type === "success" ? "Berhasil!" : toast.type === "warning" ? "Perhatian" : "Gagal"}
            </span>
            <span className="text-sm text-stone-500 font-medium">
              {toast.message}
            </span>
          </div>
        </div>
      </div>

      <Navbar
        totalItems={cart.reduce((acc, item) => acc + item.qty, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />
      <Hero />
      <Story />

      <section id="menu" className="py-20 px-8 container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-[#2d241e] mb-4">
            Menu Kami
          </h2>
          <div className="w-20 h-1 bg-amber-600 mx-auto mb-10"></div>

          {/* Search & Sort UI */}
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

            <div className="relative w-full md:w-72" ref={dropdownRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full px-6 py-4 rounded-full border border-stone-200 bg-white text-stone-600 text-sm font-bold flex justify-between items-center hover:border-amber-600 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-amber-600 text-[10px] font-black">
                    {sortOptions.find((opt) => opt.value === sortBy)?.icon}
                  </span>
                  <span>
                    {sortOptions.find((opt) => opt.value === sortBy)?.label}
                  </span>
                </div>
                <span className={`text-[10px] transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`}>
                  ▼
                </span>
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
                        ${sortBy === option.value ? "bg-amber-50 text-amber-900" : "text-stone-500 hover:bg-stone-50"}
                      `}
                    >
                      <span className={sortBy === option.value ? "font-black" : "font-medium"}>
                        {option.label}
                      </span>
                      <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">
                        {option.icon}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery("");
                }}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all border ${
                  activeCategory === cat
                    ? "bg-[#2d241e] text-white border-[#2d241e] shadow-md"
                    : "bg-white text-stone-500 border-stone-200 hover:border-amber-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] border border-stone-100 p-6 animate-pulse">
                <div className="aspect-square bg-stone-100 rounded-3xl mb-6" />
                <div className="h-6 bg-stone-200 rounded-md w-3/4 mb-4" />
                <div className="h-4 bg-stone-100 rounded-md w-1/2 mb-8" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* GRID MENU - MENGGUNAKAN currentItems (Data yang sudah dipotong) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 min-h-[500px]">
              {currentItems.length > 0 ? (
                currentItems.map((item: any) => (
                  <MenuCard
                    key={item._id}
                    item={item}
                    onAddToCart={(variant: any) => addToCart(item, variant)}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-20">
                    <p className="text-stone-400 italic text-lg">Menu tidak ditemukan.</p>
                </div>
              )}
            </div>

            {/* --- BUTTON PAGINATION (UI) --- */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-16">
                    {/* Tombol PREV */}
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white hover:border-amber-600 disabled:opacity-30 disabled:hover:border-stone-200 transition-all text-stone-600"
                    >
                        ←
                    </button>

                    {/* Tombol Angka Halaman */}
                    {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 rounded-full font-bold text-sm transition-all shadow-sm
                                    ${currentPage === pageNum 
                                        ? "bg-[#2d241e] text-white scale-110 shadow-md" 
                                        : "bg-white text-stone-500 border border-stone-200 hover:border-amber-600"
                                    }
                                `}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    {/* Tombol NEXT */}
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white hover:border-amber-600 disabled:opacity-30 disabled:hover:border-stone-200 transition-all text-stone-600"
                    >
                        →
                    </button>
                </div>
            )}
            
            {/* Indikator Halaman (Opsional) */}
            {filteredAndSortedMenu.length > 0 && (
                <p className="text-center text-xs text-stone-400 mt-4">
                    Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAndSortedMenu.length)} dari {filteredAndSortedMenu.length} menu
                </p>
            )}
          </>
        )}
      </section>

      <Footer />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onShowToast={triggerToast}
        cartItems={cart}
        onAdd={(item: any) =>
          addToCart(item, { label: item.selectedVariant, price: item.price })
        }
        onSubtract={(cartItemId: any) =>
          setCart((prev) =>
            prev
              .map((i) =>
                i.cartItemId === cartItemId ? { ...i, qty: i.qty - 1 } : i
              )
              .filter((i) => i.qty > 0)
          )
        }
        onRemove={(cartItemId: any) =>
          setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId))
        }
        onClearCart={clearCart}
      />
    </main>
  );
}