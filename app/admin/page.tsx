"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import * as XLSX from "xlsx"; // Pastikan sudah install: npm install xlsx

// --- INTERFACES ---
interface IVariant {
  label: string;
  price: number;
}

interface IMenu {
  _id?: string;
  name: string;
  category: string;
  desc: string;
  img: string;
  isAvailable?: boolean;
  variants: IVariant[];
}

interface ILog {
  _id: string;
  action: "TAMBAH" | "EDIT" | "HAPUS" | "BULK";
  menuName?: string;
  details: string;
  timestamp: string;
}

interface IOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: {
    name: string;
    quantity: number;
    variant: string;
    price: number;
  }[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"MENU" | "ORDERS">("MENU");

  // --- DATA STATES ---
  const [menuList, setMenuList] = useState<IMenu[]>([]);
  const [logs, setLogs] = useState<ILog[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // Data Orders (Auto Refresh via SWR)
  const { data: orders, mutate: mutateOrders, isLoading: isLoadingOrders } = useSWR<IOrder[]>("/api/orders", fetcher, {
    refreshInterval: 10000,
  });

  // --- UI STATES ---
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bulkModal, setBulkModal] = useState({ show: false, targetStatus: true });
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const categories = ["Semua", "Coffee", "Non-Coffee", "Pastry", "Food"];

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<IMenu | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: "", name: "" });

  const [newMenu, setNewMenu] = useState<IMenu>({
    name: "", category: "Coffee", desc: "", img: "", variants: [{ label: "Regular", price: 0 }],
  });

  // --- FETCHERS ---
  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setMenuList(Array.isArray(data) ? data : []);
    } catch (error) { console.error("Error fetching menu:", error); }
    finally { setIsLoadingMenu(false); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) setLogs(await res.json());
    } catch (error) { console.error("Error fetching logs:", error); }
  };

  useEffect(() => {
    fetchMenu();
    fetchLogs();
  }, []);

  // --- HANDLERS ---
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, mode: "new" | "edit") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) return alert("Maksimal 1MB");
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        if (mode === "new") { setNewMenu({ ...newMenu, img: res }); setImagePreview(res); }
        else if (editingData) { setEditingData({ ...editingData, img: res }); setEditImagePreview(res); }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVariantChange = (index: number, field: keyof IVariant, value: any, isEdit = false) => {
    if (isEdit && editingData) {
      const updated = [...editingData.variants];
      updated[index] = { ...updated[index], [field]: value };
      setEditingData({ ...editingData, variants: updated });
    } else {
      const updated = [...newMenu.variants];
      updated[index] = { ...updated[index], [field]: value };
      setNewMenu({ ...newMenu, variants: updated });
    }
  };

  const modifyVariantCount = (action: "add" | "remove", index?: number, isEdit = false) => {
    if (isEdit && editingData) {
      let updated = [...editingData.variants];
      if (action === "add") updated.push({ label: "", price: 0 });
      else if (index !== undefined) updated = updated.filter((_, i) => i !== index);
      setEditingData({ ...editingData, variants: updated });
    } else {
      let updated = [...newMenu.variants];
      if (action === "add") updated.push({ label: "", price: 0 });
      else if (index !== undefined) updated = updated.filter((_, i) => i !== index);
      setNewMenu({ ...newMenu, variants: updated });
    }
  };

  // --- CRUD ACTIONS ---
  const handleSaveMenu = async () => {
    if (!newMenu.name || !newMenu.img || newMenu.variants.length === 0) return alert("Data belum lengkap!");
    const res = await fetch("/api/menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newMenu) });
    if (res.ok) {
      setShowSuccessModal(true);
      setNewMenu({ name: "", category: "Coffee", desc: "", img: "", variants: [{ label: "Regular", price: 0 }] });
      setImagePreview(null);
      fetchMenu(); fetchLogs();
    }
  };

  const handleUpdateMenu = async () => {
    if (!editingData?._id) return;
    const { _id, ...data } = editingData;
    const res = await fetch(`/api/menu/${_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) { setIsEditModalOpen(false); setShowSuccessModal(true); fetchMenu(); fetchLogs(); }
  };

  const toggleStatus = async (item: IMenu) => {
    if (!item._id) return;
    const res = await fetch(`/api/menu/${item._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...item, isAvailable: !item.isAvailable }) });
    if (res.ok) { fetchMenu(); fetchLogs(); }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const res = await fetch(`/api/menu/${deleteModal.id}`, { method: "DELETE" });
    if (res.ok) { setDeleteModal({ show: false, id: "", name: "" }); fetchMenu(); fetchLogs(); }
  };

  const executeBulkStatus = async () => {
    const res = await fetch("/api/menu/bulk", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAvailable: bulkModal.targetStatus }) });
    if (res.ok) { setBulkModal({ ...bulkModal, show: false }); setShowSuccessModal(true); fetchMenu(); fetchLogs(); }
  };

  // --- ORDER ACTIONS ---
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      if (orders) {
        mutateOrders(
          orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o),
          false
        );
      }
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { mutateOrders(); }
    } catch (error) { console.error("Gagal update status:", error); }
  };

  // --- PRINT STRUK ---
  const handlePrint = (order: IOrder) => {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;
    const itemsHtml = (order.items || []).map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px;">
        <span style="flex: 1;">${item.quantity}x ${item.name} <br/> <span style="color: #666; font-size: 9px;">(${item.variant})</span></span>
        <span style="font-weight: bold;">${(item.price * item.quantity).toLocaleString('id-ID')}</span>
      </div>
    `).join('');
    const htmlContent = `
      <html>
        <head><title>Struk - ${order.orderId}</title><style>body { font-family: 'Courier New', monospace; padding: 10px; width: 58mm; margin: 0 auto; color: #000; } .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; } .title { font-weight: bold; font-size: 14px; text-transform: uppercase; } .meta { font-size: 10px; margin-bottom: 10px; line-height: 1.4; } .items { border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; } .total { display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px; } .footer { text-align: center; font-size: 10px; margin-top: 15px; font-style: italic; }</style></head>
        <body>
          <div class="header"><div class="title">RUANG NADI</div><div style="font-size: 10px;">Coffee & Space</div></div>
          <div class="meta">ID: ${order.orderId}<br/>Tgl: ${new Date(order.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' })}<br/>Pemesan: <b>${order.customerName}</b><br/>${order.customerPhone}</div>
          <div class="items">${itemsHtml}</div>
          <div class="total"><span>TOTAL</span><span>Rp ${(order.totalPrice || 0).toLocaleString('id-ID')}</span></div>
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
    if (!orders || orders.length === 0) return alert("Belum ada data pesanan untuk di-download.");
    const dataToExport = orders.map(order => ({
      "Order ID": order.orderId,
      "Tanggal": new Date(order.createdAt).toLocaleDateString('id-ID'),
      "Waktu": new Date(order.createdAt).toLocaleTimeString('id-ID'),
      "Nama Pelanggan": order.customerName,
      "No. WhatsApp": order.customerPhone,
      "Status": order.status.toUpperCase(),
      "Total Bayar": order.totalPrice,
      "Rincian Menu": (order.items || []).map(i => `${i.quantity}x ${i.name} (${i.variant})`).join(", ")
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet["!cols"] = [
      { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 80 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");
    XLSX.writeFile(workbook, `Laporan_RuangNadi_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Filter Menu
  const filteredMenu = menuList.filter(item =>
    (selectedCategory === "Semua" || item.category === selectedCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-10 font-sans text-[#2d241e]">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold text-stone-800">Admin Dashboard</h1>
            <p className="text-sm text-stone-400">Ruang Nadi Coffee</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="bg-white p-1.5 rounded-full shadow-sm border border-stone-200 flex">
              <button onClick={() => setActiveTab("MENU")} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "MENU" ? "bg-[#2d241e] text-white shadow-md" : "text-stone-500 hover:bg-stone-50"}`}>📦 Kelola Menu</button>
              <button onClick={() => setActiveTab("ORDERS")} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "ORDERS" ? "bg-[#2d241e] text-white shadow-md" : "text-stone-500 hover:bg-stone-50"}`}>
                🔔 Pesanan
                {orders && orders.some(o => o.status === 'pending') && (<span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>)}
              </button>
            </div>
            <button onClick={handleLogout} className="px-5 py-3 rounded-full bg-red-50 text-red-600 font-bold text-xs hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm">Logout ➔</button>
          </div>
        </div>

        {/* ================= TAB 1: KELOLA MENU ================= */}
        {activeTab === "MENU" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Tambah Menu */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-stone-200 mb-10">
              <h2 className="text-xl font-bold mb-6 italic text-stone-700">Tambah Menu Baru</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <input type="text" placeholder="Nama Menu" value={newMenu.name} onChange={e => setNewMenu({ ...newMenu, name: e.target.value })} className="w-full p-4 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600" />
                  <textarea placeholder="Deskripsi" value={newMenu.desc} rows={2} onChange={e => setNewMenu({ ...newMenu, desc: e.target.value })} className="w-full p-4 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600" />
                  <select value={newMenu.category} onChange={e => setNewMenu({ ...newMenu, category: e.target.value })} className="w-full p-4 bg-stone-50 rounded-2xl outline-none cursor-pointer">
                    {categories.filter(c => c !== "Semua").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="bg-stone-50 p-5 rounded-3xl border border-stone-100">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block">Varian & Harga</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {newMenu.variants.map((v, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input type="text" placeholder="Label" value={v.label} onChange={e => handleVariantChange(i, "label", e.target.value)} className="flex-1 p-3 rounded-xl text-sm border border-stone-200 focus:border-amber-500 outline-none" />
                          <input type="number" placeholder="Harga" value={v.price} onChange={e => handleVariantChange(i, "price", Number(e.target.value))} className="w-24 p-3 rounded-xl text-sm border border-stone-200 focus:border-amber-500 outline-none" />
                          <button onClick={() => modifyVariantCount("remove", i)} disabled={newMenu.variants.length === 1} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-30">✕</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => modifyVariantCount("add")} className="w-full mt-3 py-2 border-2 border-dashed border-stone-200 text-stone-400 rounded-xl text-xs font-bold hover:border-amber-400 hover:text-amber-600 transition-colors">+ Tambah Varian</button>
                  </div>
                  <input type="file" onChange={e => handleImageUpload(e, "new")} className="text-xs text-stone-500" />
                </div>
                <div className="h-64 md:h-full border-2 border-dashed border-stone-200 rounded-[2.5rem] bg-stone-50 overflow-hidden flex items-center justify-center">
                  {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <p className="text-stone-400 text-sm italic">Preview Foto</p>}
                </div>
              </div>
              <button onClick={handleSaveMenu} className="w-full mt-8 bg-[#2d241e] text-white py-4 rounded-2xl font-bold hover:bg-amber-900 shadow-lg active:scale-[0.98]">Simpan Menu</button>
            </div>
            {/* List Menu & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex gap-2">
                <button onClick={() => setBulkModal({ show: true, targetStatus: true })} className="px-4 py-3 bg-green-50 text-green-700 rounded-2xl text-[10px] font-bold uppercase border border-green-100">✅ Stock All</button>
                <button onClick={() => setBulkModal({ show: true, targetStatus: false })} className="px-4 py-3 bg-red-50 text-red-700 rounded-2xl text-[10px] font-bold uppercase border border-red-100">🚫 Sold All</button>
              </div>
              <div className="flex-1 overflow-x-auto pb-1 flex gap-2 scrollbar-hide">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full text-xs font-bold border shrink-0 ${selectedCategory === cat ? "bg-[#2d241e] text-white border-[#2d241e]" : "bg-white text-stone-500 border-stone-200"}`}>{cat}</button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <input type="text" placeholder="Cari..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-sm outline-none shadow-sm" />
                <span className="absolute left-3 top-2.5">🔍</span>
              </div>
            </div>

            {/* Table Menu (Desktop) */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-200 overflow-hidden hidden md:block">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-100 text-[10px] uppercase font-bold text-stone-500 tracking-widest">
                  <tr><th className="px-8 py-6">Menu</th><th className="px-6 py-6">Kategori</th><th className="px-6 py-6">Harga Dasar</th><th className="px-6 py-6">Status</th><th className="px-6 py-6 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {isLoadingMenu ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-stone-200 rounded-xl"></div>
                            <div className="h-4 w-32 bg-stone-200 rounded"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="h-4 w-20 bg-stone-200 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-4 w-24 bg-stone-200 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-6 w-16 bg-stone-200 rounded-full"></div></td>
                        <td className="px-6 py-4"><div className="h-8 w-20 bg-stone-200 rounded ml-auto"></div></td>
                      </tr>
                    ))
                  ) : (
                    filteredMenu.map(item => (
                      <tr key={item._id} className="hover:bg-stone-50/50">
                        <td className="px-8 py-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden"><img src={item.img} className="w-full h-full object-cover" /></div><span className="font-bold text-stone-800">{item.name}</span></td>
                        <td className="px-6 py-4 text-sm text-stone-500">{item.category}</td>
                        <td className="px-6 py-4 font-bold text-amber-800">Rp {item.variants?.[0]?.price.toLocaleString("id-ID")}</td>
                        <td className="px-6 py-4"><button onClick={() => toggleStatus(item)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item.isAvailable ? "Ready" : "Sold Out"}</button></td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => { setEditingData({ ...item }); setEditImagePreview(item.img); setIsEditModalOpen(true); }} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold">Edit</button>
                          <button onClick={() => setDeleteModal({ show: true, id: item._id!, name: item.name })} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold">Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View List Menu (Sekarang dengan Skeleton!) */}
            <div className="md:hidden space-y-4">
              {isLoadingMenu ? (
                // --- SKELETON LOADING MOBILE ---
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200 animate-pulse">
                    <div className="flex gap-4">
                      {/* Skeleton Gambar */}
                      <div className="w-20 h-20 bg-stone-200 rounded-2xl shrink-0"></div>
                      {/* Skeleton Teks */}
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                        <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                        <div className="h-4 bg-stone-200 rounded w-1/3 mt-2"></div>
                      </div>
                    </div>
                    {/* Skeleton Tombol Bawah */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                      <div className="h-8 flex-1 bg-stone-200 rounded-xl"></div>
                      <div className="h-8 w-16 bg-stone-200 rounded-xl"></div>
                      <div className="h-8 w-16 bg-stone-200 rounded-xl"></div>
                    </div>
                  </div>
                ))
              ) : (
                // --- DATA ASLI MOBILE ---
                filteredMenu.map(item => (
                  <div key={item._id} className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-stone-100 rounded-2xl overflow-hidden shrink-0"><img src={item.img} className="w-full h-full object-cover" /></div>
                      <div><h3 className="font-bold">{item.name}</h3><p className="text-xs text-stone-400">{item.category}</p><p className="text-amber-700 font-bold">Rp {item.variants?.[0]?.price.toLocaleString("id-ID")}</p></div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                      <button onClick={() => toggleStatus(item)} className={`flex-1 text-[10px] font-bold uppercase rounded-xl py-2 ${item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item.isAvailable ? "Ready" : "Habis"}</button>
                      <button onClick={() => { setEditingData({ ...item }); setEditImagePreview(item.img); setIsEditModalOpen(true); }} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold">Edit</button>
                      <button onClick={() => setDeleteModal({ show: true, id: item._id!, name: item.name })} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold">Hapus</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: MONITORING PESANAN ================= */}
        {activeTab === "ORDERS" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-800">Pesanan Masuk</h2>
                <p className="text-stone-500 text-sm">Real-time monitoring. Otomatis refresh tiap 10 detik.</p>
              </div>
              <div className="flex items-center gap-3">
                {/* BUTTON DOWNLOAD EXCEL */}
                <button onClick={downloadExcel} className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-200 transition-all border border-green-200">
                  📊 Excel
                </button>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-200 text-sm font-bold">Total: {orders?.length || 0}</div>
              </div>
            </div>

            {/* MOBILE VIEW ORDERS */}
            <div className="md:hidden space-y-4">
              {/* SKELETON LOADING MOBILE */}
              {isLoadingOrders ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-6 rounded-3xl shadow-sm border border-stone-100 bg-white animate-pulse">
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
              ) : orders?.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-stone-100"><p className="text-stone-400 italic">Belum ada pesanan.</p></div>
              ) : (
                orders?.map((order) => (
                  <div key={order._id} className={`p-6 rounded-3xl shadow-sm border flex flex-col gap-4 ${order.status === 'completed' ? 'bg-stone-50 border-stone-100 opacity-70' : 'bg-white border-stone-200'}`}>
                    <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                      <div><span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Order ID</span><p className="font-mono text-xs text-stone-600 font-bold">{order.orderId}</p></div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Waktu</span>
                        <p className="text-xs text-stone-600">{new Date(order.createdAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Customer</p>
                        <p className="font-bold text-stone-800 text-sm">{order.customerName || "-"}</p>
                        <p className="text-xs text-stone-500">{order.customerPhone || "-"}</p>
                      </div>
                      <div className="flex-1 border-l border-stone-100 pl-4">
                        <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Items</p>
                        <div className="space-y-1">{(order.items || []).map((item, idx) => (<p key={idx} className="text-xs text-stone-600 leading-tight"><span className="font-bold text-amber-700">{item.quantity}x</span> {item.name}</p>))}</div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-stone-100 flex justify-between items-center mt-1">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handlePrint(order)} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200">🖨️</button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer border-none
                                    ${order.status === "success" ? "bg-emerald-100 text-emerald-800" :
                              order.status === "pending" ? "bg-amber-100 text-amber-800" :
                                order.status === "completed" ? "bg-stone-200 text-stone-500" :
                                  "bg-rose-100 text-rose-800"}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="success">Paid / Process</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                      <p className="text-lg font-black text-stone-800">Rp {(order.totalPrice || 0).toLocaleString("id-ID")}</p>
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
                    <tr><th className="p-6">Order ID</th><th className="p-6">Tanggal</th><th className="p-6">Customer</th><th className="p-6">Items</th><th className="p-6">Total</th><th className="p-6 text-center">Status</th><th className="p-6 text-center">Print</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {/* --- SKELETON LOADING ORDERS (DESKTOP) --- */}
                    {isLoadingOrders ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="p-6"><div className="h-4 w-20 bg-stone-200 rounded"></div></td>
                          <td className="p-6"><div className="h-4 w-24 bg-stone-200 rounded"></div></td>
                          <td className="p-6">
                            <div className="h-4 w-32 bg-stone-200 rounded mb-2"></div>
                            <div className="h-3 w-20 bg-stone-100 rounded"></div>
                          </td>
                          <td className="p-6"><div className="h-4 w-40 bg-stone-200 rounded"></div></td>
                          <td className="p-6"><div className="h-4 w-24 bg-stone-200 rounded"></div></td>
                          <td className="p-6 text-center"><div className="h-6 w-20 bg-stone-200 rounded-full mx-auto"></div></td>
                          <td className="p-6 text-center"><div className="h-8 w-8 bg-stone-200 rounded mx-auto"></div></td>
                        </tr>
                      ))
                    ) : orders?.length === 0 ? (
                      <tr><td colSpan={7} className="p-10 text-center text-stone-400">Belum ada pesanan masuk.</td></tr>
                    ) : (
                      orders?.map((order) => (
                        <tr key={order._id} className={`hover:bg-stone-50/50 transition-colors ${order.status === 'completed' ? 'opacity-60 bg-stone-50' : ''}`}>
                          <td className="p-6 font-mono text-xs text-stone-400">{order.orderId}</td>
                          <td className="p-6 text-sm text-stone-600">{new Date(order.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="p-6"><p className="font-bold text-[#2d241e]">{order.customerName || "-"}</p><p className="text-xs text-stone-400">{order.customerPhone || "-"}</p></td>
                          <td className="p-6"><div className="space-y-1">{(order.items || []).map((item, idx) => (<p key={idx} className="text-sm text-stone-600"><span className="font-bold text-amber-700">{item.quantity}x</span> {item.name}<span className="text-[10px] text-stone-400 ml-1">({item.variant})</span></p>))}</div></td>
                          <td className="p-6 font-bold text-[#2d241e]">Rp {(order.totalPrice || 0).toLocaleString("id-ID")}</td>
                          <td className="p-6 text-center">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer border-none
                                    ${order.status === "success" ? "bg-emerald-100 text-emerald-800" :
                                  order.status === "pending" ? "bg-amber-100 text-amber-800" :
                                    order.status === "completed" ? "bg-stone-200 text-stone-500" :
                                      "bg-rose-100 text-rose-800"}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="success">Paid / Process</option>
                              <option value="completed">Completed</option>
                              <option value="failed">Failed</option>
                            </select>
                          </td>
                          <td className="p-6 text-center">
                            <button onClick={() => handlePrint(order)} className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-800 hover:text-white transition-all shadow-sm">🖨️</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- MODALS (EDIT, DELETE, SUCCESS) --- */}
        {isEditModalOpen && editingData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-serif font-bold mb-6">Edit Menu</h2>
                <div className="space-y-4">
                  <input type="text" value={editingData.name} onChange={e => setEditingData({ ...editingData, name: e.target.value })} className="w-full p-4 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600" />
                  <textarea value={editingData.desc} rows={3} onChange={e => setEditingData({ ...editingData, desc: e.target.value })} className="w-full p-4 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600" />
                  <select value={editingData.category} onChange={e => setEditingData({ ...editingData, category: e.target.value })} className="w-full p-4 bg-stone-50 rounded-2xl outline-none cursor-pointer">
                    {categories.filter(c => c !== "Semua").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="bg-stone-50 p-5 rounded-3xl border border-stone-100">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block">Varian</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {editingData.variants.map((v, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input type="text" value={v.label} onChange={e => handleVariantChange(i, "label", e.target.value, true)} className="flex-1 p-3 bg-white rounded-xl text-sm border border-stone-200 focus:border-amber-500 outline-none" />
                          <input type="number" value={v.price} onChange={e => handleVariantChange(i, "price", Number(e.target.value), true)} className="w-24 p-3 bg-white rounded-xl text-sm border border-stone-200 focus:border-amber-500 outline-none" />
                          <button onClick={() => modifyVariantCount("remove", i, true)} disabled={editingData.variants.length === 1} className="w-10 h-10 flex items-center justify-center bg-white border border-stone-200 text-stone-300 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-30">✕</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => modifyVariantCount("add", undefined, true)} className="w-full mt-3 py-2 border-2 border-dashed border-stone-200 text-stone-400 rounded-xl text-xs font-bold hover:border-amber-400 hover:text-amber-600 transition-colors">+ Tambah Varian</button>
                  </div>
                </div>
              </div>
              
              {/* BAGIAN KANAN: PREVIEW GAMBAR & TOMBOL (SUDAH DIPERBAIKI UNTUK MOBILE) */}
              <div className="bg-stone-50 w-full md:w-80 p-6 md:p-8 flex flex-col justify-between border-l border-stone-100">
                <div>
                  {/* Perbaikan: w-40 h-40 di mobile agar tidak full screen & rata tengah */}
                  <div className="w-40 h-40 md:w-full md:h-auto md:aspect-square mx-auto rounded-3xl md:rounded-4xl bg-white overflow-hidden mb-6 md:mb-4 relative group border-4 border-white shadow-sm">
                    {editImagePreview ? <img src={editImagePreview} className="w-full h-full object-cover" /> : <div className="p-10 text-center italic text-stone-300 flex items-center justify-center h-full">No Image</div>}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-xs font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Ganti Foto</span>
                      <input type="file" className="hidden" onChange={e => handleImageUpload(e, "edit")} />
                    </label>
                  </div>
                </div>
                <div className="space-y-3">
                  <button onClick={handleUpdateMenu} className="w-full py-4 bg-[#2d241e] text-white rounded-2xl font-bold shadow-lg hover:bg-amber-900 active:scale-[0.98]">Simpan Perubahan</button>
                  <button onClick={() => setIsEditModalOpen(false)} className="w-full py-4 bg-white text-stone-500 rounded-2xl font-bold border border-stone-200 hover:bg-stone-50">Batal</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete & Success Modals */}
        {deleteModal.show && (<div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm"><div className="bg-white rounded-4xl p-8 max-w-sm w-full text-center shadow-2xl"><h3 className="text-xl font-bold mb-2">Hapus Menu?</h3><p className="text-stone-500 mb-6 text-sm">Hapus "{deleteModal.name}" secara permanen?</p><div className="flex gap-3"><button onClick={() => setDeleteModal({ show: false, id: "", name: "" })} className="flex-1 py-3 bg-stone-100 rounded-xl font-bold">Batal</button><button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold">Hapus</button></div></div></div>)}
        {showSuccessModal && (<div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm"><div className="bg-white px-10 py-8 rounded-4xl shadow-2xl flex flex-col items-center animate-in zoom-in-95"><div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">✓</div><h3 className="text-lg font-bold text-stone-800 mb-6">Berhasil Disimpan!</h3><button onClick={() => setShowSuccessModal(false)} className="px-8 py-3 bg-stone-800 text-white rounded-xl font-bold text-sm">OK</button></div></div>)}
        {bulkModal.show && (<div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm"><div className="bg-white rounded-4xl p-8 max-w-sm w-full text-center shadow-2xl"><h3 className="text-xl font-bold mb-4">Konfirmasi Status</h3><p className="text-stone-500 mb-6 text-sm">Ubah SEMUA menu jadi {bulkModal.targetStatus ? "Available" : "Sold Out"}?</p><div className="flex gap-3"><button onClick={() => setBulkModal({ ...bulkModal, show: false })} className="flex-1 py-3 bg-stone-100 rounded-xl font-bold">Batal</button><button onClick={executeBulkStatus} className="flex-1 py-3 bg-[#2d241e] text-white rounded-xl font-bold">Ya</button></div></div></div>)}

      </div>
    </div>
  );
}