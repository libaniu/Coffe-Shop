"use client";

import { use, useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper untuk format tanggal
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params (Next.js 15 requirement or standard hook usage)
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  // Auto-refresh setiap 5 detik untuk cek status Real-time
  const {
    data: order,
    error,
    isLoading,
  } = useSWR(id ? `/api/track/${id}` : null, fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6]">
        <div className="relative w-20 h-20 flex items-center justify-center mb-6">
          <div className="absolute inset-0 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
          <span className="text-3xl animate-pulse">☕</span>
        </div>
        <p className="text-stone-400 font-bold text-xs tracking-[0.3em] uppercase animate-pulse">
          Memuat Status...
        </p>
      </div>
    );
  if (error || !order || order.error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] text-stone-400">
        <p>Pesanan tidak ditemukan.</p>
        <Link href="/" className="mt-4 text-amber-700 underline">
          Kembali ke Beranda
        </Link>
      </div>
    );

  // Tentukan Status Color & Message
  let statusColor = "bg-stone-200 text-stone-500";
  let statusMessage = "Menunggu Pembayaran";
  let statusIcon = "⏳";

  // LOGIKA STATUS DIPERBAIKI (Urutan sangat penting!)

  if (order.status === "failed") {
    statusColor = "bg-red-100 text-red-800";
    statusMessage = "Pembayaran Gagal";
    statusIcon = "❌";
  } else if (order.status === "completed") {
    statusColor = "bg-emerald-100 text-emerald-800";
    statusMessage = "Selesai";
    statusIcon = "✅";
  } else if (order.status === "success" || order.status === "pending") {
    // Jika masih success/pending, berarti masih diproses
    statusColor = "bg-amber-100 text-amber-800";
    statusMessage = "Sedang Disiapkan";
    statusIcon = "☕";
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] py-4 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-xl border border-stone-100 relative overflow-hidden">
        {/* Hiasan Atas (Struk Sobek) */}
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-600/20"></div>

        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-2">
            RUANG NADI COFFEE
          </p>
          <h1 className="text-2xl font-serif font-bold text-stone-800">
            Terima Kasih!
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Pesanan Anda telah kami terima.
          </p>
        </div>

        {/* Status Card */}
        <div
          className={`flex items-center justify-center gap-3 p-3 rounded-2xl mb-4 ${statusColor} bg-opacity-50`}
        >
          <span className="text-2xl animate-bounce">{statusIcon}</span>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">
              Status Pesanan
            </p>
            <p className="font-bold text-lg leading-tight">{statusMessage}</p>
          </div>
        </div>

        {/* Detail Pesanan */}
        <div className="border-t border-dashed border-stone-200 py-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-stone-400">Order ID</span>
            <span className="font-mono font-bold text-stone-700">
              {order.orderId}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-400">Tanggal</span>
            <span className="font-bold text-stone-700 text-right w-1/2">
              {formatDate(order.createdAt)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-400">Pemesan</span>
            <span className="font-bold text-stone-700">
              {order.customerName}
            </span>
          </div>
        </div>

        {/* List Items */}
        {/* List Items */}
        <div className="border-t border-dashed border-stone-200 py-3">
          <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2">
            Rincian Menu
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {/* PERBAIKAN: Tambahkan '?' setelah items dan fallback '|| []' */}
            {(order.items || []).map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-start text-sm"
              >
                <div className="flex gap-3">
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 rounded-md h-fit">
                    {item.quantity}x
                  </span>
                  <div>
                    <p className="text-stone-800 font-bold">{item.name}</p>
                    {!item.name
                      .toLowerCase()
                      .includes(item.variant.toLowerCase()) && (
                      <p className="text-xs text-stone-400 italic">
                        Varian: {item.variant}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-stone-600">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ))}

            {/* Jika items kosong, tampilkan pesan ini */}
            {(!order.items || order.items.length === 0) && (
              <p className="text-xs text-stone-400 italic">
                Detail item tidak tersedia untuk pesanan ini.
              </p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="border-t-2 border-stone-100 pt-4 pb-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-stone-800">
              Total Bayar
            </span>
            <span className="font-black text-xl text-amber-700">
              Rp {(order.totalPrice || 0).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-4 space-y-2">
          <Link
            href="/"
            className="block w-full py-3 bg-stone-800 text-white text-center rounded-xl font-bold text-sm hover:bg-stone-900 transition-all"
          >
            ← Kembali ke website
          </Link>
          <div className="text-center">
            <p className="text-[10px] text-stone-400">
              Simpan Order ID Anda untuk pengecekan berkala.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
