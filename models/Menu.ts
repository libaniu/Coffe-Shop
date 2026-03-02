import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVariant {
  label: string;
  price: number;
}

export interface IMenu extends Document {
  name: string;
  variants: IVariant[];
  category: string;
  desc?: string;
  img?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
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
const Menu: Model<IMenu> =
  mongoose.models.Menu || mongoose.model<IMenu>("Menu", MenuSchema);

export default Menu;
