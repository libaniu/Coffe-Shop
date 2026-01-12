import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Menu from "@/models/Menu"; // Sesuaikan path ini dengan model Menu Anda

export async function GET() {
  try {
    await connectDB();

    // 1. Array Kategori untuk diacak
    const categories = ["Coffee", "Non-Coffee", "Pastry", "Food"];
    const dummyData = [];

    // 2. Loop 50 kali untuk bikin data palsu
    for (let i = 1; i <= 50; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomPrice = (Math.floor(Math.random() * 50) + 10) * 1000; // Harga acak 10rb - 60rb

      dummyData.push({
        name: `Menu Test #${i}`,
        category: randomCategory,
        desc: `Ini adalah deskripsi palsu untuk menu test nomor ${i}. Lorem ipsum dolor sit amet.`,
        img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80", // Gambar kopi random
        isAvailable: true,
        variants: [
          { label: "Regular", price: randomPrice },
          { label: "Large", price: randomPrice + 5000 },
        ],
      });
    }

    // 3. Masukkan semua ke Database sekaligus
    await Menu.insertMany(dummyData);

    return NextResponse.json({ 
      message: "BERHASIL! 50 Data dummy sudah ditambahkan.", 
      totalAdded: dummyData.length 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal seeding data" }, { status: 500 });
  }
}