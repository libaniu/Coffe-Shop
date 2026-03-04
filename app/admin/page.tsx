"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import AdminDashboard from "./components/AdminDashboard";
import AdminMenu from "./components/AdminMenu";
import AdminOrders from "./components/AdminOrders";

import type { IMenu } from "@/models/Menu";
import type { IOrder } from "@/models/Order";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cek URL params agar tab tidak reset saat refresh
  const tabParam = searchParams.get("tab")?.toUpperCase();
  const initialTab =
    tabParam === "MENU" || tabParam === "ORDERS" ? tabParam : "DASHBOARD";

  // Tambah tab DASHBOARD
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "MENU" | "ORDERS">(
    initialTab as "DASHBOARD" | "MENU" | "ORDERS"
  );

  // --- DATA STATES ---
  const [menuList, setMenuList] = useState<IMenu[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  const {
    data: orders,
    mutate: mutateOrders,
    isLoading: isLoadingOrders,
  } = useSWR<IOrder[]>("/api/orders", fetcher, {
    refreshInterval: 5000, // Update tiap 5 detik biar grafik realtime
  });

  // --- FETCHERS ---
  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setMenuList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // --- SYNC URL & STATE ---
  // Pastikan state sinkron jika user menekan tombol Back/Forward browser
  useEffect(() => {
    const tab = searchParams.get("tab")?.toUpperCase();
    if (tab === "MENU" || tab === "ORDERS" || tab === "DASHBOARD") {
      setActiveTab(tab as "DASHBOARD" | "MENU" | "ORDERS");
    }
  }, [searchParams]);

  const handleTabChange = (tab: "DASHBOARD" | "MENU" | "ORDERS") => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab.toLowerCase()}`);
  };

  // --- HANDLERS ---
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-10 font-sans text-[#2d241e]">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold text-stone-800">
              Admin Dashboard
            </h1>
            <p className="text-sm text-stone-400">Ruang Nadi Coffee</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="bg-white p-1.5 rounded-full shadow-sm border border-stone-200 flex">
              <button
                onClick={() => handleTabChange("DASHBOARD")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === "DASHBOARD"
                    ? "bg-[#2d241e] text-white shadow-md"
                    : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => handleTabChange("MENU")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === "MENU"
                    ? "bg-[#2d241e] text-white shadow-md"
                    : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                📦 Menu
              </button>
              <button
                onClick={() => handleTabChange("ORDERS")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "ORDERS"
                    ? "bg-[#2d241e] text-white shadow-md"
                    : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                🔔 Orders
                {orders && orders.some((o) => o.status === "pending") && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-3 rounded-full bg-red-50 text-red-600 font-bold text-xs hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
            >
              Logout ➔
            </button>
          </div>
        </div>

        {/* ================= TAB 1: DASHBOARD / ANALYTICS (BARU) ================= */}
        {activeTab === "DASHBOARD" && (
          <AdminDashboard orders={orders} menuList={menuList} />
        )}

        {/* ================= TAB 2: KELOLA MENU ================= */}
        {activeTab === "MENU" && (
          <AdminMenu
            menuList={menuList}
            isLoadingMenu={isLoadingMenu}
            fetchMenu={fetchMenu}
          />
        )}

        {/* ================= TAB 3: MONITORING PESANAN ================= */}
        {activeTab === "ORDERS" && (
          <AdminOrders
            orders={orders}
            isLoadingOrders={isLoadingOrders}
            mutateOrders={mutateOrders}
          />
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-500 font-bold">
          Loading Dashboard...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}