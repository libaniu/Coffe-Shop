import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "../../../models/Order"; // Pastikan path ini sesuai dengan yang berhasil tadi

export async function POST(request) {
  try {
    const body = await request.json();
    const { order_id, transaction_status, fraud_status } = body;

    // 1. Hubungkan ke Database
    await connectDB();

    // 2. Tentukan status baru berdasarkan respon Midtrans
    let newStatus = "pending";

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      if (fraud_status === "challenge") {
        newStatus = "challenge";
      } else {
        newStatus = "success"; // UANG SUDAH MASUK / LUNAS
      }
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      newStatus = "failed";
    } else if (transaction_status === "pending") {
      newStatus = "pending";
    }

    // 3. Update status di MongoDB
    if (newStatus !== "pending") {
      await Order.findOneAndUpdate(
        { orderId: order_id },
        { status: newStatus },
        { new: true }
      );
    }

    return NextResponse.json({ message: "Webhook received", status: newStatus });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}