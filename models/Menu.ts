import mongoose, { Schema, Document, Model, models, model, Types } from "mongoose";

export interface IVariant {
  label: string;
  price: number;
}

export interface IMenu {
  _id: string;
  name: string;
  variants: IVariant[];
  category: string;
  desc?: string;
  img?: string;
  isAvailable: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const MenuSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    // MENGGANTI price (Number) menjadi variants (Array of Objects)
    variants: [
      {
        label: { type: String, required: true }, // Contoh: "Hot", "Iced (Medium)", "Iced (Large)"
        price: { type: Number, required: true }, // Contoh: 25000, 28000, 32000
      },
    ],
    category: { type: String, required: true },
    desc: { type: String },
    img: { type: String },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Cek apakah model sudah ada di cache agar tidak error "OverwriteModelError"
// Kita gunakan interface IMenu & Document untuk Model Mongoose
interface IMenuDocument extends Omit<IMenu, "_id">, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const Menu = models.Menu || model<IMenuDocument>("Menu", MenuSchema);
export default Menu;
