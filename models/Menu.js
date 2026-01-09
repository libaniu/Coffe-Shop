import mongoose from "mongoose";

const MenuSchema = new mongoose.Schema(
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
  { timestamps: true }
);

// Cek apakah model sudah ada di cache agar tidak error "OverwriteModelError"
const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema);

export default Menu;