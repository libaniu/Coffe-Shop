import mongoose, {
  Schema,
  Document,
  Model,
  models,
  model,
  Types,
} from "mongoose";

export interface IOrderItem {
  _id?: string;
  name: string;
  price: number;
  quantity: number;
  variant: string;
  image?: string;
}

export interface IOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  status: string;
  items: IOrderItem[];
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface IOrderDocument extends Omit<IOrder, "_id">, Document {
  _id: Types.ObjectId; // <--- GANTI 'string' JADI 'Types.ObjectId'
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
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
        productId: { type: String, required: true }, // Simpan ID produk di sini
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        variant: { type: String, required: true },
        image: { type: String },
      },
    ],
  },
  { timestamps: true },
);

// Mencegah error "OverwriteModelError" saat hot-reload Next.js
const Order = models.Order || model<IOrderDocument>("Order", OrderSchema);

export default Order;
