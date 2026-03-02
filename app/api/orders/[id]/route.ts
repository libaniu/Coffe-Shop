import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // PERBAIKAN: Await params untuk Next.js 15
    const { id } = await params;

    // Baca body request
    const body = await request.json();
    const { status } = body;

    console.log(`🔄 Mengupdate Order ID (DB): ${id} ke Status: ${status}`);

    await connectDB();

    // Update di Database
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { new: true },
    );

    if (!updatedOrder) {
      console.log("❌ Gagal: Order tidak ditemukan.");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("✅ Berhasil Update!");
    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("🔥 Error Update Order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // PERBAIKAN: Await params juga disini
    const { id } = await params;

    console.log(`🗑️ Menghapus Order ID (DB): ${id}`);

    await connectDB();
    const deleted = await Order.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
