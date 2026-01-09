import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order"; // Pastikan path ini benar

export async function GET(request, { params }) {
  try {
    // PERBAIKAN PENTING UNTUK NEXT.JS 15:
    // params harus di-await sebelum propertinya dibaca
    const { id } = await params;

    console.log("🔍 Mencari Order ID:", id); // Cek terminal VS Code Anda saat refresh halaman

    await connectDB();

    // Cari di database
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      console.log("❌ Order tidak ditemukan di Database.");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("✅ Order Ditemukan:", order.customerName);
    return NextResponse.json(order);
  } catch (error) {
    console.error("🔥 Error API Track:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
