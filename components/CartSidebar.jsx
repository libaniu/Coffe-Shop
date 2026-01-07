"use client";
import React, { useState } from "react";

const CartSidebar = ({
  isOpen,
  onClose,
  cartItems,
  onAdd,
  onSubtract,
  onRemove,
}) => {
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end overflow-hidden">
      {/* 1. Backdrop Blur Overlay */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity duration-500 animate-in fade-in"
        onClick={onClose}
      />

      {/* 2. Main Sidebar Panel */}
      <div className="relative w-full max-w-lg bg-[#faf9f6] h-full shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col cart-slide-in border-l border-stone-200">
        {/* Header Section */}
        <div className="p-8 border-b border-stone-200/60 flex justify-between items-end">
          <div>
            <span className="text-amber-600 font-bold tracking-[0.2em] uppercase text-[10px] mb-1 block">
              Your Selection
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#2d241e]">
              Pesanan Kamu
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-200/50 transition-all active:scale-90 text-[#2d241e]"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <div className="w-16 h-16 border-2 border-dashed border-stone-400 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl">☕</span>
              </div>
              <p className="text-stone-500 font-medium">
                Keranjang masih kosong...
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Item List */}
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-5 group animate-fadeIn"
                  >
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-stone-200">
                      <img
                        src={item.img}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        alt={item.name}
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-[#2d241e] tracking-tight">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => onRemove(item._id)}
                          className="text-stone-300 hover:text-red-500 transition-colors p-1"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-tighter">
                            Hapus
                          </span>
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-amber-800 text-sm font-black">
                          Rp {item.price.toLocaleString("id-ID")}
                        </p>

                        <div className="flex items-center bg-stone-100 rounded-xl p-1 gap-1">
                          <button
                            onClick={() => onSubtract(item._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-[#2d241e]"
                          >
                            <span className="font-bold">−</span>
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#2d241e]">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => onAdd(item)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-[#2d241e]"
                          >
                            <span className="font-bold">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Info Form */}
              <div className="pt-8 border-t border-stone-200/60 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                  Data Pemesan
                </span>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Nama"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                    className="w-full bg-white border border-stone-200 rounded-xl px-5 py-3 text-sm focus:border-amber-600 outline-none transition-all shadow-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Nomor WhatsApp"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                    className="w-full bg-white border border-stone-200 rounded-xl px-5 py-3 text-sm focus:border-amber-600 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        {cartItems.length > 0 && (
          <div className="p-8 bg-white border-t border-stone-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Total Pembayaran
                </p>
                <p className="text-3xl font-black text-[#2d241e]">
                  <span className="text-sm font-medium mr-1 uppercase">Rp</span>
                  {totalPrice.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <button className="w-full py-5 bg-[#2d241e] text-amber-50 rounded-2xl font-bold hover:bg-amber-900 transition-all active:scale-[0.98] shadow-[0_15px_30px_rgba(45,36,30,0.2)] flex justify-center items-center gap-3">
              <span>Bayar Sekarang</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <p className="text-center text-[10px] text-stone-400 mt-4 tracking-widest uppercase">
              Ruang Nadi Coffee Co.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
