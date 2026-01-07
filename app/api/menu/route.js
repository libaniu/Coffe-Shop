import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";
import Log from "@/models/Log"; 

export async function GET() {
  try {
    await connectDB();
    // Mengambil data dan memastikan hasilnya adalah array
    const menus = await Menu.find({}).lean(); 
    return NextResponse.json(menus || [], { status: 200 });
  } catch (error) {
    console.error("❌ Database GET Error:", error.message);
    return NextResponse.json({ message: "Gagal ambil data", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectDB();
    
    const newMenu = await Menu.create(body);
    
    await Log.create({
      action: "TAMBAH",
      menuName: body.name,
      details: `Menambahkan menu baru ke kategori ${body.category}`
    });

    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error("🔥 Error POST Menu:", error.message);
    return NextResponse.json({ message: "Gagal simpan data" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { isAvailable } = await request.json();
    await connectDB();
    await Menu.updateMany({}, { isAvailable: isAvailable });

    await Log.create({
      action: "BULK",
      menuName: "Semua Menu",
      details: `Mengubah status semua menu menjadi ${isAvailable ? "Tersedia" : "Sold Out"}`
    });

    return NextResponse.json({ message: "Berhasil update masal" }, { status: 200 });
  } catch (error) {
    console.error("🔥 Error PATCH Menu:", error.message);
    return NextResponse.json({ message: "Gagal update masal" }, { status: 500 });
  }
}