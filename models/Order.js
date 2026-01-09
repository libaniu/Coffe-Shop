import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // ID Unik Pesanan (RN-xxxx)
    orderId: { type: String, required: true, unique: true },
    
    // Data Customer (Pastikan camelCase agar cocok dengan tokenizer)
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    
    // Total Harga
    totalPrice: { type: Number, required: true },
    
    // Status (pending, success, completed, failed)
    status: { type: String, default: "pending" },
    
    // Rincian Item (Agar tidak error saat di-map)
    items: [
      {
        _id: String,
        name: String,
        price: Number,
        quantity: Number,
        variant: String,
        image: String,
      },
    ],
  },
  { timestamps: true }
);

// Mencegah error "OverwriteModelError" saat hot-reload Next.js
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);