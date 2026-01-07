"use client";
import React from "react";
import Image from "next/image";

const Hero = () => {
  return (
    <header className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#2d241e]">
      
      {/* 1. LAYER DASAR: Gambar Background */}
      <div className="absolute inset-0 z-0">
        <Image
          alt="Ruang Nadi Ambiance"
          src="/img/cafe.webp"
          fill
          priority
          className="object-cover object-center scale-105"
        />
        
        {/* 2. LAYER OVERLAY: Cinematic Gradient (V4 Syntax) */}
        {/* 'from-black/80' untuk pastikan teks putih kamu tajam di atas */}
        {/* 'to-[#2d241e]' agar menyatu dengan background dasar */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-[#2d241e]/90" />
      </div>

      {/* 3. LAYER CONTENT: Teks & Tombol */}
      <div className="relative z-10 px-6 text-center max-w-5xl mx-auto">
        <span className="text-amber-400 font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs mb-6 block drop-shadow-md">
          Premium Coffee Experience
        </span>

        <h1 className="text-5xl md:text-8xl font-serif leading-[1.1] text-white mb-8 drop-shadow-2xl">
          Menemukan <br />
          <span className="italic font-light text-stone-200">
            Ketenangan
          </span>{" "}
          di Sini.
        </h1>

        <p className="text-stone-100 text-sm md:text-xl max-w-2xl mx-auto leading-relaxed opacity-90 font-light drop-shadow">
          Setiap tetes kopi di Ruang Nadi dipilih dari biji terbaik untuk
          menemani setiap detak ceritamu hari ini.
        </p>

        <div className="mt-12">
          <button 
            onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
          >
            Eksplor Menu
          </button>
        </div>
      </div>

      {/* 4. LAYER TRANSISI: Halus ke section bawah */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-[#faf9f6] dark:from-slate-950 to-transparent z-20" />
    </header>
  );
};

export default Hero;