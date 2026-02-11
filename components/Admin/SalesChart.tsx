"use client"; // Wajib karena pake interaksi browser

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Contoh data dummy dulu (Nanti kita ganti data asli dari API)
const data = [
  { name: "Senin", total: 400000 },
  { name: "Selasa", total: 300000 },
  { name: "Rabu", total: 550000 },
  { name: "Kamis", total: 700000 },
  { name: "Jumat", total: 450000 },
  { name: "Sabtu", total: 900000 },
  { name: "Minggu", total: 1200000 },
];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function SalesChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Grafik Penjualan 7 Hari Terakhir
      </h3>

      <div className="h-75 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F172A" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" style={{ fontSize: "12px" }} />
            <YAxis
              tickFormatter={(value) => `Rp${value / 1000}k`}
              style={{ fontSize: "12px" }}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip
              formatter={(value: any) => [formatRupiah(value), "Omzet"]}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0F172A"
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
