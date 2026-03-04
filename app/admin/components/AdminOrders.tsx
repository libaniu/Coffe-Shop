// c:\Users\Admin\Documents\Project\ruang-nadi\components\AdminOrders.tsx

import React, { useState } from "react";
import * as XLSX from "xlsx";
import type { IOrder } from "@/models/Order";

interface AdminOrdersProps {
  orders: IOrder[] | undefined;
  isLoadingOrders: boolean;
  mutateOrders: any;
}

export default function AdminOrders({
  orders,
  isLoadingOrders,
  mutateOrders,
}: AdminOrdersProps) {
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [orderFilterType, setOrderFilterType] = useState<"daily" | "monthly">(
    "daily"
  );
  const [filterStatus, setFilterStatus] = useState("Semua");

  // --- FILTER ORDERS ---
  const filteredOrders =
    orders?.filter((order) => {
      const matchesDate =
        orderFilterType === "daily"
          ? !filterDate ||
            (() => {
              const d = new Date(order.createdAt);
              const dateString = `${d.getFullYear()}-${String(
                d.getMonth() + 1
              ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              return dateString === filterDate;
            })()
          : !filterMonth ||
            (() => {
              const d = new Date(order.createdAt);
              const monthString = `${d.getFullYear()}-${String(
                d.getMonth() + 1
              ).padStart(2, "0")}`;
              return monthString === filterMonth;
            })();
      const matchesSearch =
        !orderSearchTerm ||
        order.customerName
          .toLowerCase()
          .includes(orderSearchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "Semua" || order.status === filterStatus;
      return matchesDate && matchesSearch && matchesStatus;
    }) || [];

  // --- ORDER ACTIONS ---
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const targetOrder = orders?.find((o) => o._id === orderId);

      if (orders) {
        mutateOrders(
          orders.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o
          ),
          false
        );
      }
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        mutateOrders();

        // --- AUTO WHATSAPP JIKA COMPLETED ---
        if (newStatus === "completed" && targetOrder) {
          let phone = targetOrder.customerPhone.replace(/\D/g, "");
          if (phone.startsWith("0")) {
            phone = "62" + phone.slice(1);
          }

          const itemsList = (targetOrder.items || [])
            .map((item) => {
              const showVariant = !item.name
                .toLowerCase()
                .includes(item.variant.toLowerCase());
              return `- ${item.quantity}x ${item.name}${
                showVariant ? ` (${item.variant})` : ""
              }`;
            })
            .join("\n");

          const message = `Halo Kak *${
            targetOrder.customerName
          }*!\nPesanan Kakak dengan Order ID: *${
            targetOrder.orderId
          }*sudah SELESAI.\n\nRincian Pesanan:\n${itemsList}\nTotal: Rp ${targetOrder.totalPrice.toLocaleString(
            "id-ID"
          )}\n\nTerima kasih telah memesan di Ruang Nadi Coffee!`;

          window.open(
            `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
            "_blank"
          );
        }
      }
    } catch (error) {
      console.error("Gagal update status:", error);
    }
  };

  // --- PRINT STRUK ---
  const handlePrint = (order: IOrder) => {
    const printWindow = window.open("", "", "width=300,height=600");
    if (!printWindow) return;
    const itemsHtml = (order.items || [])
      .map((item) => {
        const showVariant = !item.name
          .toLowerCase()
          .includes(item.variant.toLowerCase());
        return `
      <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px;">
        <span style="flex: 1;">${item.quantity}x ${item.name} <br/> ${
          showVariant
            ? `<span style="color: #666; font-size: 9px;">(${item.variant})</span>`
            : ""
        }</span>
        <span style="font-weight: bold;">${(
          item.price * item.quantity
        ).toLocaleString("id-ID")}</span>
      </div>
    `;
      })
      .join("");
    const htmlContent = `
      <html>
        <head><title>Struk - ${
          order.orderId
        }</title><style>body { font-family: 'Courier New', monospace; padding: 10px; width: 58mm; margin: 0 auto; color: #000; } .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; } .title { font-weight: bold; font-size: 14px; text-transform: uppercase; } .meta { font-size: 10px; margin-bottom: 10px; line-height: 1.4; } .items { border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; } .total { display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px; } .footer { text-align: center; font-size: 10px; margin-top: 15px; font-style: italic; }</style></head>
        <body>
          <div class="header"><div class="title">RUANG NADI</div><div style="font-size: 10px;">Coffee & Space</div></div>
          <div class="meta">ID: ${order.orderId}<br/>Tgl: ${new Date(
      order.createdAt
    ).toLocaleString("id-ID", {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })}<br/>Pemesan: <b>${order.customerName}</b><br/>${
      order.customerPhone
    }</div>
          <div class="items">${itemsHtml}</div>
          <div class="total"><span>TOTAL</span><span>Rp ${(
            order.totalPrice || 0
          ).toLocaleString("id-ID")}</span></div>
          <div class="footer">Terima Kasih<br/>~ Ruang Nadi ~</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- EXPORT EXCEL ---
  const downloadExcel = () => {
    if (!filteredOrders || filteredOrders.length === 0)
      return alert("Belum ada data pesanan untuk di-download.");
    const dataToExport = filteredOrders.map((order) => ({
      "Order ID": order.orderId,
      Tanggal: new Date(order.createdAt).toLocaleDateString("id-ID"),
      Waktu: new Date(order.createdAt).toLocaleTimeString("id-ID"),
      "Nama Pelanggan": order.customerName,
      "No. WhatsApp": order.customerPhone,
      Status: order.status.toUpperCase(),
      "Total Bayar": order.totalPrice,
      "Rincian Menu": (order.items || [])
        .map((i) => {
          const showVariant = !i.name
            .toLowerCase()
            .includes(i.variant.toLowerCase());
          return `${i.quantity}x ${i.name}${
            showVariant ? ` (${i.variant})` : ""
          }`;
        })
        .join(", "),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 80 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");
    XLSX.writeFile(
      workbook,
      `Laporan_RuangNadi_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center mb-8 gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-800">Orders</h2>
        </div>
        <div className="w-full flex flex-col md:flex-row items-center justify-center relative gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari Customer..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-600 w-48 transition-all"
              />
              <span className="absolute left-3 top-2 text-stone-400 text-xs">
                🔍
              </span>
            </div>

            {/* TOGGLE HARIAN / BULANAN */}
            <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1">
              <button
                onClick={() => setOrderFilterType("daily")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orderFilterType === "daily"
                    ? "bg-stone-100 text-stone-800"
                    : "text-stone-400 hover:bg-stone-50"
                }`}
              >
                Harian
              </button>
              <button
                onClick={() => setOrderFilterType("monthly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orderFilterType === "monthly"
                    ? "bg-stone-100 text-stone-800"
                    : "text-stone-400 hover:bg-stone-50"
                }`}
              >
                Bulanan
              </button>
            </div>

            {orderFilterType === "daily" ? (
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold outline-none focus:border-amber-600 text-stone-600"
              />
            ) : (
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold outline-none focus:border-amber-600 text-stone-600"
              />
            )}

            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-200 text-sm font-bold">
              Total: {filteredOrders.length}
            </div>
          </div>

          {/* BUTTON DOWNLOAD EXCEL */}
          <div className="md:absolute md:right-0">
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-200 transition-all border border-green-200"
            >
              📊 Export
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW ORDERS */}
      <div className="md:hidden space-y-4">
        {isLoadingOrders ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl shadow-sm border border-stone-100 bg-white animate-pulse"
            >
              <div className="flex justify-between mb-4">
                <div className="h-4 w-20 bg-stone-200 rounded"></div>
                <div className="h-4 w-24 bg-stone-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-stone-200 rounded"></div>
                <div className="h-4 w-2/3 bg-stone-200 rounded"></div>
              </div>
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-stone-100">
            <p className="text-stone-400 italic">Belum ada pesanan.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className={`p-6 rounded-3xl shadow-sm border flex flex-col gap-4 ${
                order.status === "completed"
                  ? "bg-stone-50 border-stone-100 opacity-70"
                  : "bg-white border-stone-200"
              }`}
            >
              <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">
                    Order ID
                  </span>
                  <p className="font-mono text-xs text-stone-600 font-bold">
                    {order.orderId}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">
                    Waktu
                  </span>
                  <p className="text-xs text-stone-600">
                    {new Date(order.createdAt).toLocaleString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">
                    Customer
                  </p>
                  <p className="font-bold text-stone-800 text-sm">
                    {order.customerName || "-"}
                  </p>
                  <p className="text-xs text-stone-500">
                    {order.customerPhone || "-"}
                  </p>
                </div>
                <div className="flex-1 border-l border-stone-100 pl-4">
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">
                    Items
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                    {(order.items || []).map((item, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-stone-600 leading-tight"
                      >
                        <span className="font-bold text-amber-700">
                          {item.quantity}x
                        </span>{" "}
                        {item.name}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-stone-100 flex justify-between items-center mt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrint(order)}
                    className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200"
                  >
                    🖨️
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer border-none
                                    ${
                                      order.status === "success"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : order.status === "pending"
                                        ? "bg-amber-100 text-amber-800"
                                        : order.status === "completed"
                                        ? "bg-stone-200 text-stone-500"
                                        : "bg-rose-100 text-rose-800"
                                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="success">Paid / Process</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <p className="text-lg font-black text-stone-800">
                  Rp {(order.totalPrice || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP VIEW ORDERS */}
      <div className="hidden md:block bg-white rounded-4xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50 border-b border-stone-100 text-xs font-bold uppercase tracking-widest text-stone-500">
              <tr>
                <th className="p-6">Order ID</th>
                <th className="p-6">Tanggal</th>
                <th className="p-6">Customer</th>
                <th className="p-6">Items</th>
                <th className="p-6">Total</th>
                <th className="p-6 text-center">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent text-xs font-bold uppercase tracking-widest text-stone-500 outline-none cursor-pointer"
                  >
                    <option value="Semua">STATUS (ALL)</option>
                    <option value="pending">PENDING</option>
                    <option value="success">PROCESS</option>
                    <option value="completed">COMPLETED</option>
                    <option value="failed">FAILED</option>
                  </select>
                </th>
                <th className="p-6 text-center">Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {/* --- SKELETON LOADING ORDERS (DESKTOP) --- */}
              {isLoadingOrders ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6">
                      <div className="h-4 w-20 bg-stone-200 rounded"></div>
                    </td>
                    <td className="p-6">
                      <div className="h-4 w-24 bg-stone-200 rounded"></div>
                    </td>
                    <td className="p-6">
                      <div className="h-4 w-32 bg-stone-200 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-stone-100 rounded"></div>
                    </td>
                    <td className="p-6">
                      <div className="h-4 w-40 bg-stone-200 rounded"></div>
                    </td>
                    <td className="p-6">
                      <div className="h-4 w-24 bg-stone-200 rounded"></div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="h-6 w-20 bg-stone-200 rounded-full mx-auto"></div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="h-8 w-8 bg-stone-200 rounded mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-stone-400">
                    Belum ada pesanan masuk.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className={`hover:bg-stone-50/50 transition-colors ${
                      order.status === "completed"
                        ? "opacity-60 bg-stone-50"
                        : ""
                    }`}
                  >
                    <td className="p-6 font-mono text-xs text-stone-400">
                      {order.orderId}
                    </td>
                    <td className="p-6 text-sm text-stone-600">
                      {new Date(order.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-[#2d241e]">
                        {order.customerName || "-"}
                      </p>
                      <p className="text-xs text-stone-400">
                        {order.customerPhone || "-"}
                      </p>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                        {(order.items || []).map((item, idx) => (
                          <p key={idx} className="text-sm text-stone-600">
                            <span className="font-bold text-amber-700">
                              {item.quantity}x
                            </span>{" "}
                            {item.name}
                            {!item.name
                              .toLowerCase()
                              .includes(item.variant.toLowerCase()) && (
                              <span className="text-[10px] text-stone-400 ml-1">
                                ({item.variant})
                              </span>
                            )}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="p-6 font-bold text-[#2d241e]">
                      Rp {(order.totalPrice || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="p-6 text-center">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value)
                        }
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer border-none
                                    ${
                                      order.status === "success"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : order.status === "pending"
                                        ? "bg-amber-100 text-amber-800"
                                        : order.status === "completed"
                                        ? "bg-stone-200 text-stone-500"
                                        : "bg-rose-100 text-rose-800"
                                    }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="success">Paid / Process</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="p-6 text-center">
                      <button
                        onClick={() => handlePrint(order)}
                        className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-800 hover:text-white transition-all shadow-sm"
                      >
                        🖨️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
