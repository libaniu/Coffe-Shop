import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "../../../models/Order"; // Menggunakan jalur manual yang terbukti berhasil

export async function GET() {
  try {
    // 1. Koneksi Database
    await connectDB();

    // 2. Ambil semua data order, urutkan dari yang TERBARU (createdAt: -1)
    const orders = await Order.find({}).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}