"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin");
      } else {
        setError(data.message || "Login Gagal");
      }
    } catch (err) {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6 text-[#2d241e]">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-12 shadow-sm border border-stone-100">
        <div className="text-center mb-10">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">← RuangNadi</Link>
          <h1 className="text-3xl font-serif font-bold text-stone-800 mt-4">Admin Access</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 text-[10px] font-bold uppercase p-4 rounded-2xl border border-red-100 text-center">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Username</label>
            <input
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-5 bg-stone-50 border border-stone-100 rounded-3xl outline-none focus:border-amber-600 transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-5 bg-stone-50 border border-stone-100 rounded-3xl outline-none focus:border-amber-600 transition-all text-sm font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2d241e] text-white py-5 rounded-3xl font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all hover:bg-amber-900 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}