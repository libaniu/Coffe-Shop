import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";
import Log from "@/models/Log"; 

export async function GET() {
  try {
    await connectDB();
    const menus = await Menu.find({});
    return NextResponse.json(menus, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal ambil data" }, { status: 500 });
  }
}

// HANYA SATU FUNGSI POST
export async function POST(request) {
  try {
    const body = await request.json();
    await connectDB();
    
    // 1. Simpan menu
    const newMenu = await Menu.create(body);
    
    // 2. Catat Log secara otomatis
    await Log.create({
      action: "TAMBAH",
      menuName: body.name,
      details: `Menambahkan menu baru ke kategori ${body.category}`
    });

    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error("🔥 Error POST Menu:", error);
    return NextResponse.json({ message: "Gagal simpan data" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { isAvailable } = body;
    await connectDB();
    await Menu.updateMany({}, { isAvailable: isAvailable });

    await Log.create({
      action: "BULK",
      menuName: "Semua Menu",
      details: `Mengubah status semua menu menjadi ${isAvailable ? "Tersedia" : "Sold Out"}`
    });

    return NextResponse.json({ message: "Berhasil update masal" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal update masal" }, { status: 500 });
  }
}