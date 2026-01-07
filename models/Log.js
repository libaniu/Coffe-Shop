import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // Contoh: "TAMBAH", "EDIT", "HAPUS", "BULK"
  menuName: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Log || mongoose.model("Log", LogSchema);