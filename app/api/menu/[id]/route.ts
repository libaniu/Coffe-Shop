import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";

// Tipe untuk Params di Next.js 15 (Promise)
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // 1. WAJIB AWAIT PARAMS DULU (Next.js 15)
    const { id } = await params;

    const body = await request.json();
    await connectDB();

    const updatedMenu = await Menu.findByIdAndUpdate(id, body, { new: true });

    if (!updatedMenu) {
      return NextResponse.json(
        { message: "Menu tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedMenu, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal update data" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // 1. WAJIB AWAIT PARAMS DULU
    const { id } = await params;

    await connectDB();
    const deletedMenu = await Menu.findByIdAndDelete(id);

    if (!deletedMenu) {
      return NextResponse.json(
        { message: "Menu tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Menu berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Gagal hapus data" }, { status: 500 });
  }
}
