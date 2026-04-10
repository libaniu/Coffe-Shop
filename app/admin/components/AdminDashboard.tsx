// c:\Users\Admin\Documents\Project\ruang-nadi\components\AdminDashboard.tsx

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { IMenu } from "@/models/Menu";
import type { IOrder } from "@/models/Order";

interface AdminDashboardProps {
  orders: IOrder[] | undefined;
  menuList: IMenu[];
}

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AdminDashboard({
  orders,
  menuList,
}: AdminDashboardProps) {
  const [filterType, setFilterType] = useState<"daily" | "monthly">("daily");
  const [dashboardDate, setDashboardDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dashboardMonth, setDashboardMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  // --- ANALYTICS LOGIC ---
  const analyticsData = useMemo(() => {
    if (!orders)
      return { chartData: [], totalOmzet: 0, totalOrders: 0, avgOrder: 0 };

    const completedOrders = orders.filter((o) => o.status === "completed");
    const totalOmzet = completedOrders.reduce(
      (acc, curr) => acc + curr.totalPrice,
      0,
    );
    const totalOrders = completedOrders.length;
    const avgOrder = totalOrders > 0 ? totalOmzet / totalOrders : 0;

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });

      const dailyTotal = completedOrders
        .filter(
          (o) => new Date(o.createdAt).toISOString().split("T")[0] === dateStr,
        )
        .reduce((acc, curr) => acc + curr.totalPrice, 0);

      chartData.push({
        name: dayName,
        date: dateStr,
        total: dailyTotal,
      });
    }

    return { chartData, totalOmzet, totalOrders, avgOrder };
  }, [orders]);

  // --- FILTERED DASHBOARD STATS ---
  const dashboardStats = useMemo(() => {
    if (!orders)
      return { totalOmzet: 0, totalOrders: 0, avgOrder: 0, soldItems: [] };

    const completed = orders.filter((o) => o.status === "completed");
    let filtered = completed;

    if (filterType === "daily" && dashboardDate) {
      filtered = completed.filter(
        (o) =>
          new Date(o.createdAt).toISOString().split("T")[0] === dashboardDate,
      );
    } else if (filterType === "monthly" && dashboardMonth) {
      filtered = completed.filter(
        (o) =>
          new Date(o.createdAt).toISOString().slice(0, 7) === dashboardMonth,
      );
    }

    const totalOmzet = filtered.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const totalOrders = filtered.length;
    const avgOrder = totalOrders > 0 ? totalOmzet / totalOrders : 0;

    const itemMap = new Map<
      string,
      { name: string; variant: string; qty: number; total: number }
    >();
    filtered.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = `${item.name}-${item.variant}`;
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            name: item.name,
            variant: item.variant,
            qty: 0,
            total: 0,
          });
        }
        const entry = itemMap.get(key)!;
        entry.qty += item.quantity;
        entry.total += item.price * item.quantity;
      });
    });

    const soldItems = Array.from(itemMap.values()).sort(
      (a, b) => b.qty - a.qty,
    );

    return { totalOmzet, totalOrders, avgOrder, soldItems };
  }, [orders, filterType, dashboardDate, dashboardMonth]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-full">
          <button
            onClick={() => setFilterType("daily")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filterType === "daily"
                ? "bg-white shadow text-stone-800"
                : "text-stone-500"
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setFilterType("monthly")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filterType === "monthly"
                ? "bg-white shadow text-stone-800"
                : "text-stone-500"
            }`}
          >
            Bulanan
          </button>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-bold text-stone-500 whitespace-nowrap">
            Periode:
          </span>
          {filterType === "daily" ? (
            <input
              type="date"
              value={dashboardDate}
              onChange={(e) => setDashboardDate(e.target.value)}
              className="w-full md:w-auto px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold outline-none focus:border-amber-600"
            />
          ) : (
            <input
              type="month"
              value={dashboardMonth}
              onChange={(e) => setDashboardMonth(e.target.value)}
              className="w-full md:w-auto px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold outline-none focus:border-amber-600"
            />
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-4xl shadow-sm border border-stone-200 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-green-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest relative z-10">
            Pendapatan (
            {filterType === "daily" ? dashboardDate : dashboardMonth})
          </p>
          <h3 className="text-3xl font-black text-stone-800 mt-2 relative z-10">
            {formatRupiah(dashboardStats.totalOmzet)}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-4xl shadow-sm border border-stone-200 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest relative z-10">
            Pesanan Selesai
          </p>
          <h3 className="text-3xl font-black text-stone-800 mt-2 relative z-10">
            {dashboardStats.totalOrders}{" "}
            <span className="text-lg font-normal text-stone-400">
              Transaksi
            </span>
          </h3>
        </div>
        <div className="bg-white p-6 rounded-4xl shadow-sm border border-stone-200 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest relative z-10">
            Rata-rata / Order
          </p>
          <h3 className="text-3xl font-black text-stone-800 mt-2 relative z-10">
            {formatRupiah(dashboardStats.avgOrder)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ITEM TERJUAL SECTION */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-stone-200">
          <h3 className="text-xl font-bold text-stone-800 mb-6">
            Rincian Penjualan
          </h3>
          <div className="overflow-auto max-h-96 custom-scrollbar pr-4">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase font-bold text-stone-400 border-b border-stone-100 sticky top-0 bg-white z-10">
                <tr>
                  <th className="pb-3">Menu</th>
                  <th className="pb-3">Varian</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {dashboardStats.soldItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-stone-400 italic"
                    >
                      Tidak ada penjualan di periode ini.
                    </td>
                  </tr>
                ) : (
                  dashboardStats.soldItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-3 font-bold text-stone-700">
                        {item.name}
                      </td>
                      <td className="py-3 text-xs text-stone-500">
                        {item.variant}
                      </td>
                      <td className="py-3 text-center">
                        <span className="bg-amber-50 text-amber-800 px-2 py-1 rounded-lg font-bold text-xs">
                          {item.qty}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-stone-700">
                        {formatRupiah(item.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Hari Ini */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-stone-200">
          <h3 className="text-xl font-bold text-stone-800 mb-6">Status Menu</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">
                  ☕
                </div>
                <div className="text-sm font-bold text-stone-600">
                  Total Menu
                </div>
              </div>
              <span className="text-xl font-black">{menuList.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm text-green-600">
                  ✓
                </div>
                <div className="text-sm font-bold text-green-700">
                  Available
                </div>
              </div>
              <span className="text-xl font-black text-green-700">
                {menuList.filter((m) => m.isAvailable).length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm text-red-600">
                  ✕
                </div>
                <div className="text-sm font-bold text-red-700">Sold Out</div>
              </div>
              <span className="text-xl font-black text-red-700">
                {menuList.filter((m) => !m.isAvailable).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GRAFIK PENJUALAN */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-stone-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-stone-800">Trend Penjualan</h3>
          <span className="text-xs bg-stone-100 px-3 py-1 rounded-full text-stone-500 font-bold">
            7 Hari Terakhir
          </span>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={analyticsData.chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d241e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2d241e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f5f5f4"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#a8a29e" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#a8a29e" }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
                formatter={(value: any) => [formatRupiah(value), "Omzet"]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#2d241e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
