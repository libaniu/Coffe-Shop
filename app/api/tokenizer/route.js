import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb"; // Pastikan tetap pakai kurung kurawal { connectDB }
import Order from "@/models/Order"; 

let snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, price, quantity, customer_name, customer_phone, items } = body;

    // 1. Koneksi Database
    await connectDB(); 

    // 2. Simpan Order ke MongoDB (Status: Pending)
    await Order.create({
      orderId: id,
      customerName: customer_name,
      customerPhone: customer_phone,
      totalPrice: price,
      status: "pending",
      items: items.map((item) => ({
        _id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: item.name.match(/\((.*?)\)/)?.[1] || "-", 
        image: item.image || "", 
      })),
    });

    // 3. Request Token ke Midtrans
    let parameter = {
      item_details: items.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name.substring(0, 50),
      })),
      transaction_details: {
        order_id: id,
        gross_amount: price,
      },
      customer_details: {
        first_name: customer_name,
        phone: customer_phone,
      },
    };

    const token = await snap.createTransaction(parameter);

    return NextResponse.json({ token: token.token });
  } catch (error) {
    console.error("Tokenizer Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}