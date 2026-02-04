"use client";
import React from "react";
import Link from "next/link"; // Jangan lupa import Link

const Footer = () => {
  return (
    <footer className="bg-[#2d241e] text-[#faf9f6] pt-32 pb-10 px-6 md:px-12 relative overflow-hidden font-sans">
      {/* Dekorasi Background Halus - Gradient Radial untuk depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-stone-800/20 via-[#2d241e] to-[#2d241e] pointer-events-none"></div>

      {/* Seamless Transition Gradient (Light to Dark) */}
      <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-[#faf9f6] to-[#2d241e]"></div>

      <div className="container mx-auto relative z-10">
        {/* SECTION 2: MAIN GRID */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Kolom 1: Brand & Admin */}
          <div className="col-span-2 md:col-span-5 space-y-8 pr-0 md:pr-12">
            <div>
              <h2 className="text-3xl font-serif font-bold tracking-tighter mb-4">
                RUANG<span className="text-amber-600">NADI</span>
              </h2>
              <p className="text-stone-400 text-sm leading-relaxed">
                Sebuah ruang kecil di Radio Dalam yang didedikasikan untuk kopi,
                percakapan, dan ketenangan di tengah hiruk pikuk kota.
              </p>
            </div>

            {/* Admin Button - Redesigned */}
            <Link
              href="/login"
              className="inline-flex items-center gap-3 group opacity-60 hover:opacity-100 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center border border-stone-700 group-hover:border-amber-600/50 transition-colors">
                <span className="text-sm">🔐</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold group-hover:text-amber-500 transition-colors">
                  Staff Portal
                </span>
                <span className="text-xs font-medium text-stone-400 group-hover:text-white">
                  Login Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Kolom 2: Explore */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold mb-6 uppercase text-[11px] tracking-[0.2em] text-amber-600">
              Explore
            </h4>
            <ul className="space-y-4 text-sm text-stone-300 font-medium">
              {["Menu", "Our Story", "Reservasi", "Karir"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-amber-500 hover:pl-2 transition-all duration-300 block"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4: Socials */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold mb-6 uppercase text-[11px] tracking-[0.2em] text-amber-600">
              Social
            </h4>
            <ul className="space-y-4 text-sm text-stone-300 font-medium">
              {["Instagram", "TikTok", "Spotify"].map((social) => (
                <li key={social}>
                  <a
                    href="#"
                    className="flex items-center gap-2 hover:text-amber-500 hover:translate-x-1 transition-all duration-300 group"
                  >
                    {social}
                    <span className="opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-[10px]">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Visit Us */}
          <div className="col-span-2 md:col-span-3">
            <h4 className="font-bold mb-6 uppercase text-[11px] tracking-[0.2em] text-amber-600">
              Visit Us
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 text-sm text-stone-300">
              <p className="leading-relaxed">
                Jl. Radio Dalam Raya No. 12
                <br />
                Jakarta Selatan, 12140
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-[80px_1fr] items-center text-xs">
                  <span className="text-stone-500 font-medium">Mon - Fri</span>
                  <span className="text-stone-300 font-bold">
                    08:00 - 22:00
                  </span>
                </div>
                <div className="grid grid-cols-[80px_1fr] items-center text-xs">
                  <span className="text-stone-500 font-medium">Sat - Sun</span>
                  <span className="text-white font-bold">09:00 - 23:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-stone-800/60 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-stone-500 uppercase tracking-widest font-bold">
          <p>© 2024 Ruang Nadi Coffee. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-stone-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-stone-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
