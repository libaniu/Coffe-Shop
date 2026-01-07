import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    await connectDB();

    // 1. Mencari admin berdasarkan username
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return NextResponse.json({ message: "Username tidak terdaftar" }, { status: 401 });
    }

    // 2. Validasi password
    if (admin.password !== password) {
      return NextResponse.json({ message: "Password salah" }, { status: 401 });
    }

    // 3. SET SESSION COOKIE (Kunci Akses)
    // Kita buat respon sukses terlebih dahulu
    const response = NextResponse.json(
      { message: "Login Berhasil, Mengalihkan..." },
      { status: 200 }
    );

    // Memasang cookie 'admin_session' agar browser "mengingat" admin
    response.cookies.set("admin_session", "true", {
      httpOnly: true, // Tidak bisa diintip oleh JavaScript (Aman dari XSS)
      secure: process.env.NODE_ENV === "production", // Hanya lewat HTTPS di production
      sameSite: "strict", // Mencegah serangan CSRF
      maxAge: 60 * 60 * 24, // Berlaku selama 24 jam
      path: "/", // Berlaku di seluruh rute website
    });

    return response;
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}