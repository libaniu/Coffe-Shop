"use client";
import React from "react";
import Image from "next/image";

const Story = () => {
  return (
    <section id="story" className="py-24 bg-[#faf9f6] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          {/* BAGIAN GAMBAR - Visualisasi Kehangatan */}
          <div className="w-full md:w-1/2 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform md:-rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src="/img/cafe.webp" // Pastikan kamu punya foto interior kafe
                alt="Suasana Ruang Nadi"
                width={600}
                height={800}
                className="object-cover w-full h-500px"
              />
            </div>
            {/* Dekorasi Aksen Amber */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-amber-500/10 rounded-full z-0 blur-3xl" />
            <div className="absolute -top-6 -left-6 border-2 border-amber-500/20 w-32 h-32 rounded-2xl z-0" />
          </div>

          {/* BAGIAN TEKS - Narasi Ruang Nadi */}
          <div className="w-full md:w-1/2 space-y-8">
            <div className="space-y-2">
              <span className="text-amber-600 font-bold tracking-[0.3em] uppercase text-xs">
                Our Philosophy
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2d241e] leading-tight">
                Lebih dari Sekadar <br /> 
                <span className="italic font-light text-amber-800">Ruang Menunggu.</span>
              </h2>
            </div>

            <div className="space-y-6 text-stone-600 leading-relaxed text-lg font-light">
              <p>
                Terletak di jantung <span className="font-semibold text-[#2d241e]">Radio Dalam</span>, Ruang Nadi lahir dari sebuah ide sederhana: menyediakan tempat di mana waktu seolah melambat di tengah hiruk-pikuk Jakarta.
              </p>
              
              <p>
                Nama <span className="italic font-medium text-[#2d241e]">"Nadi"</span> dipilih sebagai simbol kehidupan. Kami percaya bahwa setiap cangkir kopi yang kami sajikan memiliki detak ceritanya sendiri—baik itu obrolan hangat bersama kawan lama, hingga momen refleksi diri di sore hari.
              </p>

              <p>
                Kami tidak hanya menjual kopi; kami merawat koneksi. Dengan biji pilihan dan sentuhan artisanal, kami ingin menjadi saksi dari setiap detak inspirasi yang muncul di meja-meja kami.
              </p>
            </div>

            {/* Signature atau Kutipan Kecil */}
            <div className="pt-4 border-t border-stone-200">
              <p className="font-serif italic text-[#2d241e] opacity-80">
                "Menemukan ketenangan di antara sela-sela detak hari."
              </p>
              <p className="text-xs uppercase tracking-widest text-amber-700 font-bold mt-2">
                — Tim Ruang Nadi
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Story;