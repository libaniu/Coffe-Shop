"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // 1. Import Router

const CartSidebar = ({
  isOpen,
  onClose,
  cartItems,
  onAdd,
  onSubtract,
  onRemove,
  onClearCart,
  onShowToast,
}) => {
  const router = useRouter(); // 2. Inisialisasi Router
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const handleCheckout = async () => {
    // Validasi Input
    if (!customer.name || !customer.phone) {
      if (onShowToast) onShowToast("Harap isi Nama & Nomor WhatsApp!", "error");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Request Token Transaksi ke Backend
      const response = await fetch("/api/tokenizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `RN-${Date.now()}`,
          name: `Pesanan: ${customer.name}`,
          price: totalPrice,
          quantity: 1,
          customer_name: customer.name,
          customer_phone: customer.phone,
          items: cartItems.map((item) => ({
            id: item._id,
            name: `${item.name} (${item.selectedVariant})`,
            price: item.price,
            quantity: item.qty,
          })),
        }),
      });

      const data = await response.json();

      // 2. Munculkan Popup Midtrans
      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: (result) => {
            console.log("Success:", result);
            
            // Notifikasi Sukses
            if (onShowToast) onShowToast("Pembayaran Berhasil! Mengalihkan...", "success");
            
            // Bersihkan Keranjang & Tutup Sidebar
            if (onClearCart) onClearCart(); 
            onClose();

            // 3. REDIRECT KE HALAMAN TRACKING (Fitur Baru)
            // Menggunakan order_id dari result Midtrans
            router.push(`/order/${result.order_id}`);
          },
          onPending: (result) => {
            console.log("Pending:", result);
            if (onShowToast) onShowToast("Menunggu Pembayaran...", "warning");
          },
          onError: (result) => {
            console.error("Error:", result);
            if (onShowToast) onShowToast("Pembayaran Gagal.", "error");
          },
          onClose: () => {
            if (onShowToast) onShowToast("Pembayaran belum selesai.", "warning");
          }
        });
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      if (onShowToast) onShowToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end overflow-hidden">
      {/* Overlay Gelap */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity duration-500 animate-in fade-in"
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className="relative w-full max-w-md bg-[#faf9f6] h-full shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col cart-slide-in border-l border-stone-200">
        
        {/* Header */}
        <div className="p-8 border-b border-stone-200/60 flex justify-between items-end">
          <div>
            <span className="text-amber-600 font-bold tracking-[0.2em] uppercase text-[10px] mb-1 block">
              Your Selection
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#2d241e]">
              Pesanan Kamu
            </h2>
          </div>
          
          <div className="flex gap-4 items-center">
            {/* Tombol Close (X) */}
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-200/50 transition-all active:scale-90 text-[#2d241e]"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>

        {/* Content List Item */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <div className="w-16 h-16 border-2 border-dashed border-stone-400 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl">☕</span>
              </div>
              <p className="text-stone-500 font-medium">Keranjang kosong...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex gap-5 group animate-fadeIn">
                    {/* Gambar Produk */}
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-stone-200">
                      <img
                        src={item.img}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        alt={item.name}
                      />
                    </div>

                    {/* Detail Produk */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-[#2d241e] tracking-tight">
                            {item.name}
                          </h4>
                          {item.selectedVariant && (
                            <p className="text-[10px] text-amber-700 font-medium uppercase tracking-wider mt-0.5">
                              {item.selectedVariant}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => onRemove(item.cartItemId)}
                          className="text-stone-300 hover:text-red-500 transition-colors p-1"
                        >
                          <span className="text-[10px] font-bold uppercase">Hapus</span>
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-amber-800 text-sm font-black">
                          Rp {item.price.toLocaleString("id-ID")}
                        </p>

                        <div className="flex items-center bg-stone-100 rounded-xl p-1 gap-1">
                          <button
                            onClick={() => onSubtract(item.cartItemId)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white transition-all text-[#2d241e]"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#2d241e]">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => onAdd(item, { label: item.selectedVariant, price: item.price })}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white transition-all text-[#2d241e]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Data Pemesan */}
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

        {/* Footer / Checkout Button */}
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

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className={`w-full py-5 bg-[#2d241e] text-amber-50 rounded-2xl font-bold transition-all shadow-[0_15px_30px_rgba(45,36,30,0.2)] flex justify-center items-center gap-3 ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-amber-900 active:scale-[0.98]"
              }`}
            >
              <span>{isLoading ? "Memproses..." : "Bayar Sekarang"}</span>
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