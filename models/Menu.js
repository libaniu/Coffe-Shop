import mongoose from "mongoose";

const MenuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
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