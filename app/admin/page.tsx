"use client";
import { useState, useEffect } from "react";
// 1. Ganti Link dengan useRouter untuk redirect manual
import { useRouter } from "next/navigation"; 

// 2. Interface (Tetap Sama)
interface IMenu {
  _id?: string;
  name: string;
  price: number | string;
  category: string;
  desc: string;
  img: string;
  isAvailable?: boolean;
}

interface ILog {
  _id: string;
  action: "TAMBAH" | "EDIT" | "HAPUS" | "BULK";
  menuName?: string;
  details: string;
  timestamp: string;
}

export default function AdminDashboard() {
  // 3. Inisialisasi Router
  const router = useRouter();

  const [menuList, setMenuList] = useState<IMenu[]>([]);
  const [logs, setLogs] = useState<ILog[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUpdateSuccessModal, setShowUpdateSuccessModal] = useState(false);
  const [bulkModal, setBulkModal] = useState({ show: false, targetStatus: true });

  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const categories = ["Semua", "Coffee", "Non-Coffee", "Pastry", "Food"];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<IMenu | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState({ show: false, id: "", name: "" });

  const [newMenu, setNewMenu] = useState<IMenu>({
    name: "",
    price: "",
    category: "Coffee",
    desc: "",
    img: "",
  });

  // --- FUNGSI LOGOUT BARU ---
  const handleLogout = async () => {
    try {
      // Panggil API Logout untuk hapus cookie
      await fetch("/api/auth/logout", { method: "POST" });
      
      // Redirect ke halaman login
      router.push("/");
      router.refresh(); // Refresh agar middleware mendeteksi perubahan
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  // --- FUNGSI AMBIL DATA ---
  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setMenuList(data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Gagal ambil riwayat:", error);
    }
  };

  useEffect(() => { 
    fetchMenu(); 
    //fetchLogs();
  }, []);

  const filteredMenu = menuList.filter((item) => {
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- HANDLER LOGIC ---

  const openBulkModal = (status: boolean) => {
    setBulkModal({ show: true, targetStatus: status });
  };

  const executeBulkStatus = async () => {
    const status = bulkModal.targetStatus;
    try {
      const res = await fetch("/api/menu/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: status }),
      });

      if (res.ok) {
        setMenuList((prev) => prev.map((item) => ({ ...item, isAvailable: status })));
        setBulkModal({ show: false, targetStatus: true });
        setShowUpdateSuccessModal(true);
        fetchLogs(); 
      }
    } catch (error) {
      console.error("Gagal memperbarui status masal.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, mode: "new" | "edit") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) return alert("File Terlalu Besar, Maksimal 1MB");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (mode === "new") {
          setNewMenu({ ...newMenu, img: base64String });
          setImagePreview(base64String);
        } else if (editingData) {
          setEditingData({ ...editingData, img: base64String });
          setEditImagePreview(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMenu = async () => {
    if (!newMenu.name || !newMenu.price || !newMenu.img) return alert("Lengkapi Data Menu!!!");
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMenu, price: Number(newMenu.price) }),
    });
    if (res.ok) {
      setShowSuccessModal(true);
      setNewMenu({ name: "", price: "", category: "Coffee", desc: "", img: "" });
      setImagePreview(null);
      fetchMenu();
      fetchLogs();
    }
  };

  const openEditModal = (item: IMenu) => {
    setEditingData({ ...item });
    setEditImagePreview(item.img);
    setIsEditModalOpen(true);
  };

  const handleUpdateMenu = async () => {
    if (!editingData || !editingData._id) return;
    const { _id, ...dataToUpdate } = editingData;
    const res = await fetch(`/api/menu/${_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...dataToUpdate, price: Number(dataToUpdate.price) }),
    });
    if (res.ok) {
      setIsEditModalOpen(false);
      fetchMenu();
      setShowUpdateSuccessModal(true);
      fetchLogs();
    }
  };

  const toggleStatus = async (item: IMenu) => {
    if (!item._id) return;
    const newStatus = !item.isAvailable;
    const { _id, ...rest } = item;
    const res = await fetch(`/api/menu/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rest, isAvailable: newStatus, price: Number(item.price) }),
    });

    if (res.ok) {
      setMenuList((prev) => prev.map((menu) => menu._id === item._id ? { ...menu, isAvailable: newStatus } : menu));
      fetchLogs();
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const res = await fetch(`/api/menu/${deleteModal.id}`, { method: "DELETE" });
    if (res.ok) {
      setMenuList((prev) => prev.filter((item) => item._id !== deleteModal.id));
      setDeleteModal({ show: false, id: "", name: "" });
      fetchLogs();
    }
  };

  return (
    <div className="p-3 md:p-10 bg-stone-50 min-h-screen text-[#2d241e]">
      <div className="max-w-5xl mx-auto pb-20">
        {/* HEADER DENGAN TOMBOL LOGOUT */}
        <div className="flex justify-between items-center mb-8 px-2">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-800">Admin Dashboard</h1>
          
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-50 text-red-600 font-bold text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
          >
            Logout
            <span className="text-lg">➔</span>
          </button>
        </div>

        {/* SISA KONTEN TETAP SAMA */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-stone-200 mb-10">
          <h2 className="text-xl font-bold mb-6 italic text-stone-700">Tambah Menu Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <input type="text" placeholder="Nama Menu" value={newMenu.name} className="w-full p-4 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600" onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })} />
              <textarea placeholder="Deskripsi" value={newMenu.desc} rows={2} className="w-full p-4 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600" onChange={(e) => setNewMenu({ ...newMenu, desc: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Harga" value={newMenu.price} className="w-full p-4 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600" onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })} />
                <select value={newMenu.category} className="w-full p-4 bg-stone-50 rounded-2xl outline-none cursor-pointer" onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}>
                  <option value="Coffee">Coffee</option>
                  <option value="Non-Coffee">Non-Coffee</option>
                  <option value="Pastry">Pastry</option>
                  <option value="Food">Food</option>
                </select>
              </div>
              <input type="file" accept="image/*" className="text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#2d241e] file:text-white file:cursor-pointer" onChange={(e) => handleImageUpload(e, "new")} />
            </div>
            <div className="h-48 border-2 border-dashed border-stone-200 rounded-[2.5rem] flex items-center justify-center bg-stone-50 overflow-hidden">
              {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <p className="text-stone-400 text-sm italic">Preview Foto</p>}
            </div>
          </div>
          <button onClick={handleSaveMenu} className="w-full mt-6 bg-[#2d241e] text-white py-4 rounded-2xl font-bold hover:bg-amber-900 transition-all shadow-lg active:scale-95">Simpan Menu</button>
        </div>

        {/* BULK ACTIONS */}
        <div className="flex gap-4 mb-6 px-2">
          <button onClick={() => openBulkModal(true)} className="flex-1 py-4 bg-green-50 text-green-700 rounded-2xl text-[16px] font-bold uppercase tracking-widest border border-green-100 hover:bg-green-600 hover:text-white transition-all">
            ✅ In Stock
          </button>
          <button onClick={() => openBulkModal(false)} className="flex-1 py-4 bg-red-50 text-red-700 rounded-2xl text-[16px] font-bold uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all">
            🚫 Sold Out 
          </button>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat ? "bg-[#2d241e] text-white border-[#2d241e]" : "bg-white text-stone-500 border-stone-200 hover:border-amber-800"}`}>{cat}</button>
            ))}
          </div>
          <div className="relative w-full md:w-64 group">
            <input type="text" placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-amber-600 outline-none shadow-sm transition-all" />
            <span className="absolute left-3 top-3 text-stone-400">🔍</span>
          </div>
        </div>

        {/* TABEL DATA DENGAN SKELETON */}
        <div className="bg-white rounded-4xl shadow-sm border border-stone-200 overflow-hidden mb-20">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-150">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr className="text-[10px] uppercase tracking-widest font-bold text-stone-800">
                  <th className="px-6 py-5">Menu</th>
                  <th className="px-6 py-5">Kategori</th>
                  <th className="px-6 py-5">Harga</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {isLoading ? (
                  // Skeleton Rows
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-100 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-100 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-stone-100 rounded-full w-20"></div></td>
                      <td className="px-6 py-4 flex gap-2">
                        <div className="h-8 bg-stone-200 rounded-full w-14"></div>
                        <div className="h-8 bg-stone-200 rounded-full w-14"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredMenu.length > 0 ? (
                  filteredMenu.map((item) => (
                    <tr key={item._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-stone-800">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-stone-500">{item.category}</td>
                      <td className="px-6 py-4 text-amber-800 font-bold">Rp {Number(item.price).toLocaleString("id-ID")}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleStatus(item)} className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {item.isAvailable ? "Tersedia" : "Sold Out"}
                        </button>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button onClick={() => openEditModal(item)} className="bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all">Edit</button>
                        <button onClick={() => setDeleteModal({ show: true, id: item._id!, name: item.name })} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all">Hapus</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center py-20 italic text-stone-400">Menu tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION RIWAYAT AKTIVITAS */}
        <div className="mt-20 px-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-xl shadow-inner">📜</div>
            <div>
              <h3 className="text-xl font-serif font-bold text-stone-800">Riwayat Aktivitas</h3>
              <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-black italic">System Logs</p>
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              // Skeleton Logs
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white border border-stone-200 rounded-4xl animate-pulse">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-6 bg-stone-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-stone-200 rounded w-48"></div>
                      <div className="h-3 bg-stone-100 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : logs.length === 0 ? (
              <p className="text-center py-10 text-stone-300 italic text-sm">Belum ada aktivitas tercatat.</p>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="flex items-center justify-between p-5 bg-white border border-stone-200 rounded-4xl hover:shadow-md transition-all">
                  <div className="flex items-center gap-5">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      log.action === 'HAPUS' ? 'bg-red-50 text-red-500' : 
                      log.action === 'TAMBAH' ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {log.action}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-stone-800">
                        {log.menuName ? `${log.menuName}: ` : ""}{log.details}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1 font-medium">
                        {new Date(log.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL EDIT */}
      {isEditModalOpen && editingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-8 md:p-10 max-w-2xl w-full shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-8 text-[#2d241e]">Edit Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <input type="text" value={editingData.name} onChange={(e) => setEditingData({ ...editingData, name: e.target.value })} className="w-full p-4 bg-stone-50 rounded-2xl outline-none" placeholder="Nama" />
                <textarea value={editingData.desc} rows={2} onChange={(e) => setEditingData({ ...editingData, desc: e.target.value })} className="w-full p-4 bg-stone-50 rounded-2xl outline-none" placeholder="Deskripsi" />
                <input type="number" value={editingData.price} onChange={(e) => setEditingData({ ...editingData, price: e.target.value })} className="w-full p-4 bg-stone-50 rounded-2xl outline-none" placeholder="Harga" />
                <select value={editingData.category} onChange={(e) => setEditingData({ ...editingData, category: e.target.value })} className="w-full p-4 bg-stone-50 rounded-2xl outline-none">
                  {categories.filter(c => c !== "Semua").map(cat => ( <option key={cat} value={cat}>{cat}</option> ))}
                </select>
              </div>
              <div>
                <div className="h-44 rounded-3xl bg-stone-50 overflow-hidden border-2 border-dashed border-stone-200 mb-4 flex items-center justify-center">
                  {editImagePreview ? <img src={editImagePreview} className="w-full h-full object-cover" /> : <p className="text-xs text-stone-400 italic">No Image</p>}
                </div>
                <input type="file" accept="image/*" className="text-[10px]" onChange={(e) => handleImageUpload(e, "edit")} />
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={handleUpdateMenu} className="flex-1 py-4 bg-[#2d241e] text-white rounded-2xl font-bold">Simpan</button>
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl font-bold">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-xl font-bold text-[#2d241e] mb-2">Hapus Menu</h3>
            <p className="text-stone-500 mb-8 text-sm italic">Hapus <span className="font-bold">"{deleteModal.name}"</span>?</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold">Ya, Hapus</button>
              <button onClick={() => setDeleteModal({ show: false, id: "", name: "" })} className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTION CONFIRMATION MODAL */}
      {bulkModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-xl font-bold text-[#2d241e] mb-4">Konfirmasi Status</h3>
            <p className="text-stone-500 mb-8 text-sm italic">
              Setel <span className="font-bold">SEMUA MENU</span> menjadi{' '}
              <span className={`font-bold uppercase ${bulkModal.targetStatus ? 'text-green-600' : 'text-red-600'}`}>
                {bulkModal.targetStatus ? 'Tersedia' : 'Sold Out'}
              </span>?
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={executeBulkStatus} className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg ${bulkModal.targetStatus ? 'bg-green-600' : 'bg-red-600'}`}>Ya, Lanjutkan</button>
              <button onClick={() => setBulkModal({ show: false, targetStatus: true })} className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODALS */}
      {(showSuccessModal || showUpdateSuccessModal) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-xl font-bold text-[#2d241e] mb-8">Berhasil Disimpan!</h3>
            <button onClick={() => { setShowSuccessModal(false); setShowUpdateSuccessModal(false); }} className="w-full py-4 bg-[#2d241e] text-white rounded-2xl font-bold">Selesai</button>
          </div>
        </div>
      )}
    </div>
  );
}