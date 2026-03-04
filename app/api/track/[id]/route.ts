import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // PERBAIKAN PENTING UNTUK NEXT.JS 15:
    // params harus di-await sebelum propertinya dibaca
    const { id } = await params;

    await connectDB();

    // Cari di database
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("🔥 Error API Track:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
