import mongoose, { Schema, Document, Model } from "mongoose";

interface IOrderItem {
  _id?: string;
  name: string;
  price: number;
  quantity: number;
  variant: string;
  image?: string;
}

interface IOrder extends Document {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  status: string;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
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
  { timestamps: true },
);

// Mencegah error "OverwriteModelError" saat hot-reload Next.js
const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
