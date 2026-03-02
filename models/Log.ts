import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILog extends Document {
  action: string;
  menuName?: string;
  details?: string;
  timestamp: Date;
}

const LogSchema: Schema = new Schema({
  action: { type: String, required: true }, // Contoh: "TAMBAH", "EDIT", "HAPUS", "BULK"
  menuName: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
});

// Cek apakah model sudah ada di cache
const Log: Model<ILog> =
  mongoose.models.Log || mongoose.model<ILog>("Log", LogSchema);

export default Log;
