"use client";
import React from "react";
import Link from "next/link"; // Jangan lupa import Link

const Footer = () => {
  return (
    <footer className="bg-[#2d241e] text-[#faf9f6] pt-20 pb-10 px-6 md:px-12 border-t border-stone-800 relative overflow-hidden">
      {/* Dekorasi Background Halus */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#2d241e] via-amber-900 to-[#2d241e] opacity-50"></div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-stone-800 pb-16">
          
          {/* Kolom 1: Brand & Slogan */}
          <div className="md:col-span-4 space-y-6">
            <h2 className="text-4xl font-serif font-bold tracking-tighter">
              RUANG<span className="text-amber-600">NADI</span>
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              Tempat di mana setiap detak cerita bertemu dengan aroma kopi terbaik. 
              Menemani harimu, satu cangkir sekaligus di Radio Dalam.
            </p>
            
            {/* TOMBOL ADMIN KEREN DISINI */}
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-stone-800/50 border border-stone-700/50 hover:bg-stone-800 hover:border-amber-600/50 transition-all duration-300 group backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center border border-stone-700 group-hover:border-amber-600 transition-colors">
                  <span className="text-xs group-hover:text-amber-500">🔒</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold group-hover:text-amber-600 transition-colors">Internal Only</span>
                  <span className="text-xs font-bold text-stone-300 group-hover:text-white">Admin Portal Access</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Kolom 2: Tautan */}
          <div className="md:col-span-2">
            <h4 className="font-bold mb-8 uppercase text-[11px] tracking-[0.2em] text-amber-600">
              Navigasi
            </h4>
            <ul className="space-y-4 text-sm text-stone-300 font-medium">
              {["Menu", "Cerita Kami", "Lokasi"].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(" ", "")}`} className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Jam Operasional */}
          <div className="md:col-span-3">
            <h4 className="font-bold mb-8 uppercase text-[11px] tracking-[0.2em] text-amber-600">
              Jam Buka
            </h4>
            <ul className="space-y-4 text-sm text-stone-300">
              <li className="flex justify-between border-b border-stone-800/50 pb-2">
                <span>Senin - Jumat</span>
                <span className="text-white font-bold">08:00 - 22:00</span>
              </li>
              <li className="flex justify-between border-b border-stone-800/50 pb-2">
                <span>Sabtu - Minggu</span>
                <span className="text-white font-bold">09:00 - 23:00</span>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Social & Contact */}
          <div className="md:col-span-3">
            <h4 className="font-bold mb-8 uppercase text-[11px] tracking-[0.2em] text-amber-600">
              Connect
            </h4>
            <div className="flex gap-4 mb-8">
              {["IG", "TT", "FB"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-12 h-12 rounded-2xl bg-stone-800 flex items-center justify-center hover:bg-amber-600 hover:-translate-y-1 transition-all duration-300 shadow-lg group"
                >
                  <span className="text-xs font-black text-stone-400 group-hover:text-white tracking-tighter">
                    {social}
                  </span>
                </a>
              ))}
            </div>
            <p className="text-xs text-stone-500 italic">
              "Kopi adalah bahasa cinta yang diseduh."
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-stone-500 uppercase tracking-widest font-bold">
          <p>© 2026 Ruang Nadi Coffee.</p>
          <p className="mt-4 md:mt-0">
            Bekasi, Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;