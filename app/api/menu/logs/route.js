import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Log from "@/Models/Log"; // Sesuaikan Import: Folder "models" (atau Models) dan File "Log"

export async function GET() {
  try {
    await connectDB();

    // Ambil 10 aktivitas terbaru, urutkan dari yang paling baru (descending)
    const logs = await Log.find({}).sort({ timestamp: -1 }).limit(10);

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ message: "Gagal mengambil log" }, { status: 500 });
  }
}