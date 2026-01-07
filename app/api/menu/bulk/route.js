import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb"; // Gunakan kurung {} (Named Import)
import Menu from "@/models/Menu";

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { isAvailable } = body;

    await connectDB();
    
    // Update semua dokumen di database
    await Menu.updateMany({}, { isAvailable: isAvailable });

    return NextResponse.json({ message: "Berhasil update status masal" }, { status: 200 });
  } catch (error) {
    console.error("🔥 ERROR BULK PATCH:", error);
    return NextResponse.json({ message: "Gagal update masal", error: error.message }, { status: 500 });
  }
}