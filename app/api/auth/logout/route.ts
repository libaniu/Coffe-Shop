import { NextResponse } from "next/server";

export async function POST() {
  // Buat respon sukses
  const response = NextResponse.json({ message: "Berhasil Logout" });
  
  // Hapus cookie session
  response.cookies.delete("admin_session");
  
  return response;
}