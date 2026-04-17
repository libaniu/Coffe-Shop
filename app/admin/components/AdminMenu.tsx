// c:\Users\Admin\Documents\Project\ruang-nadi\components\AdminMenu.tsx

import React, { useState } from "react";
import type { IMenu, IVariant } from "@/models/Menu";

interface AdminMenuProps {
  menuList: IMenu[];
  isLoadingMenu: boolean;
  fetchMenu: () => void;
}

export default function AdminMenu({
  menuList,
  isLoadingMenu,
  fetchMenu,
}: AdminMenuProps) {
  const categories = ["All", "Coffee", "Non-Coffee", "Pastry", "Food"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Modals & Forms
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<IMenu | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Successfully Saved!");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  
  // State Delete Modal
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: "",
    name: "",
  });

  // State Bulk Modal
  const [bulkModal, setBulkModal] = useState({
    show: false,
    targetStatus: true,
  });

  const [newMenu, setNewMenu] = useState<IMenu>({
    _id: "", // Placeholder
    name: "",
    category: "Coffee",
    desc: "",
    img: "",
    variants: [{ label: "Regular", price: 0 }],
    isAvailable: true,
  });

  // --- HANDLERS ---

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "new" | "edit"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) return alert("Max 1MB");
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        if (mode === "new") {
          setNewMenu({ ...newMenu, img: res });
          setImagePreview(res);
        } else if (editingData) {
          setEditingData({ ...editingData, img: res });
          setEditImagePreview(res);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVariantChange = (
    index: number,
    field: keyof IVariant,
    value: any,
    isEdit = false
  ) => {
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

  const modifyVariantCount = (
    action: "add" | "remove",
    index?: number,
    isEdit = false
  ) => {
    if (isEdit && editingData) {
      let updated = [...editingData.variants];
      if (action === "add") updated.push({ label: "", price: 0 });
      else if (index !== undefined)
        updated = updated.filter((_, i) => i !== index);
      setEditingData({ ...editingData, variants: updated });
    } else {
      let updated = [...newMenu.variants];
      if (action === "add") updated.push({ label: "", price: 0 });
      else if (index !== undefined)
        updated = updated.filter((_, i) => i !== index);
      setNewMenu({ ...newMenu, variants: updated });
    }
  };

  const handleSaveMenu = async () => {
    if (!newMenu.name || !newMenu.img || newMenu.variants.length === 0)
      return alert("Incomplete data!");
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...menuData } = newMenu; // Buang _id kosong
    
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menuData),
    });
    
    if (res.ok) {
      setSuccessMessage("Successfully Saved!");
      setShowSuccessModal(true);
      setNewMenu({
        _id: "",
        name: "",
        category: "Coffee",
        desc: "",
        img: "",
        variants: [{ label: "Regular", price: 0 }],
        isAvailable: true,
      });
      setImagePreview(null);
      setIsAddFormOpen(false);
      fetchMenu();
    }
  };

  const handleUpdateMenu = async () => {
    if (!editingData?._id) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...data } = editingData;
    
    const res = await fetch(`/api/menu/${_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      setIsEditModalOpen(false);
      setSuccessMessage("Successfully Saved!");
      setShowSuccessModal(true);
      fetchMenu();
    }
  };

  // --- FUNGSI-FUNGSI INI SEKARANG SUDAH DI LUAR handleUpdateMenu ---

  const toggleStatus = async (item: IMenu) => {
    if (!item._id) return;
    const res = await fetch(`/api/menu/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, isAvailable: !item.isAvailable }),
    });
    if (res.ok) {
      fetchMenu();
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const res = await fetch(`/api/menu/${deleteModal.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setDeleteModal({ show: false, id: "", name: "" });
      setSuccessMessage("Successfully Deleted!");
      setShowSuccessModal(true);
      fetchMenu();
    }
  };

  const executeBulkStatus = async () => {
    const res = await fetch("/api/menu/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: bulkModal.targetStatus }),
    });
    if (res.ok) {
      setBulkModal({ ...bulkModal, show: false });
      setSuccessMessage("Status Successfully Changed!");
      setShowSuccessModal(true);
      fetchMenu();
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter Menu Logic
  const filteredMenu = menuList
    .filter(
      (item) =>
        (selectedCategory === "All" || item.category === selectedCategory) &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;

      let valA: any;
      let valB: any;

      if (key === "price") {
        valA = a.variants?.[0]?.price || 0;
        valB = b.variants?.[0]?.price || 0;
      } else if (key === "isAvailable") {
        valA = a.isAvailable !== false;
        valB = b.isAvailable !== false;
      } else {
        valA = a[key as keyof IMenu];
        valB = b[key as keyof IMenu];
      }

      if (typeof valA === "string" && typeof valB === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

  // --- RETURN STATEMENT SEKARANG AMAN ---
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* --- KONTROL ATAS: Actions, Filter & Search --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 bg-white p-4 rounded-3xl shadow-sm border border-stone-200">
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className={`w-full md:w-auto justify-center px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 border ${
              isAddFormOpen
                ? "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                : "bg-[#2d241e] text-white border-[#2d241e] hover:bg-amber-900 hover:shadow-md active:scale-95"
            }`}
          >
            {isAddFormOpen ? "✕ Close Form" : "+ Add Menu"}
          </button>
          <button
            onClick={() => setBulkModal({ show: true, targetStatus: true })}
            className="flex-1 md:flex-none text-center px-4 py-2.5 bg-green-50 text-green-700 rounded-2xl text-[10px] font-bold uppercase border border-green-100 hover:bg-green-100 transition-colors"
          >
            ✅ Stock All
          </button>
          <button
            onClick={() => setBulkModal({ show: true, targetStatus: false })}
            className="flex-1 md:flex-none text-center px-4 py-2.5 bg-red-50 text-red-700 rounded-2xl text-[10px] font-bold uppercase border border-red-100 hover:bg-red-100 transition-colors"
          >
            🚫 Sold All
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto overflow-hidden">
          <div className="flex overflow-x-auto pb-1 gap-2 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold border shrink-0 transition-all ${
                  selectedCategory === cat
                    ? "bg-[#2d241e] text-white border-[#2d241e] shadow-md"
                    : "bg-stone-50 text-stone-500 border-stone-200 hover:border-amber-400 hover:text-amber-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64 shrink-0">
            <input
              type="text"
              placeholder="Search Menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none focus:border-amber-500 focus:bg-white transition-all shadow-inner"
            />
            <span className="absolute left-3 top-2.5 opacity-50">🔍</span>
          </div>
        </div>
      </div>

      {/* Form Tambah Menu */}
      {isAddFormOpen && (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-stone-200 mb-10 animate-in slide-in-from-top-4 fade-in duration-300">
        <h2 className="text-xl font-bold mb-6 italic text-stone-700">
          Add New Menu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Menu Name"
              value={newMenu.name}
              onChange={(e) =>
                setNewMenu({ ...newMenu, name: e.target.value })
              }
              className="w-full p-4 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600"
            />
            <textarea
              placeholder="Description"
              value={newMenu.desc}
              rows={2}
              onChange={(e) =>
                setNewMenu({ ...newMenu, desc: e.target.value })
              }
              className="w-full p-4 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600"
            />
            <select
              value={newMenu.category}
              onChange={(e) =>
                setNewMenu({ ...newMenu, category: e.target.value })
              }
              className="w-full p-4 bg-stone-50 rounded-2xl outline-none cursor-pointer"
            >
              {categories
                .filter((c) => c !== "All")
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
            <div className="bg-stone-50 p-5 rounded-3xl border border-stone-100">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block">
                Variants & Price
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {newMenu.variants.map((v, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Label"
                      value={v.label}
                      onChange={(e) =>
                        handleVariantChange(i, "label", e.target.value)
                      }
                      className="flex-1 p-3 rounded-xl text-sm border border-stone-200 focus:border-amber-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={v.price}
                      onChange={(e) =>
                        handleVariantChange(
                          i,
                          "price",
                          Number(e.target.value)
                        )
                      }
                      className="w-24 p-3 rounded-xl text-sm border border-stone-200 focus:border-amber-500 outline-none"
                    />
                    <button
                      onClick={() => modifyVariantCount("remove", i)}
                      disabled={newMenu.variants.length === 1}
                      className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => modifyVariantCount("add")}
                className="w-full mt-3 py-2 border-2 border-dashed border-stone-200 text-stone-400 rounded-xl text-xs font-bold hover:border-amber-400 hover:text-amber-600 transition-colors"
              >
                + Add Variant
              </button>
            </div>
            <input
              type="file"
              onChange={(e) => handleImageUpload(e, "new")}
              className="text-xs text-stone-500"
            />
          </div>
          <div className="h-64 md:h-full border-2 border-dashed border-stone-200 rounded-[2.5rem] bg-stone-50 overflow-hidden flex items-center justify-center">
            {imagePreview ? (
              <img
                src={imagePreview}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : (
              <p className="text-stone-400 text-sm italic">Photo Preview</p>
            )}
          </div>
        </div>
        <button
          onClick={handleSaveMenu}
          className="w-full mt-8 bg-[#2d241e] text-white py-4 rounded-2xl font-bold hover:bg-amber-900 shadow-lg active:scale-[0.98]"
        >
          Save Menu
        </button>
      </div>
      )}

      {/* Table Menu (Desktop) */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-200 overflow-hidden hidden md:block">
        <table className="w-full text-left">
          <thead className="bg-stone-100 border-b border-stone-100 text-[10px] uppercase font-bold text-stone-600 tracking-widest">
            <tr>
              <th
                className="px-8 py-6 cursor-pointer hover:text-stone-700 transition-colors select-none"
                onClick={() => handleSort("name")}
              >
                Menu{" "}
                {sortConfig?.key === "name" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-6 cursor-pointer hover:text-stone-700 transition-colors select-none"
                onClick={() => handleSort("category")}
              >
                Category{" "}
                {sortConfig?.key === "category" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-6 cursor-pointer hover:text-stone-700 transition-colors select-none"
                onClick={() => handleSort("price")}
              >
                Price{" "}
                {sortConfig?.key === "price" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-6 cursor-pointer hover:text-stone-700 transition-colors select-none"
                onClick={() => handleSort("isAvailable")}
              >
                Status{" "}
                {sortConfig?.key === "isAvailable" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-6 py-6 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {isLoadingMenu
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-stone-200 rounded-xl"></div>
                        <div className="h-4 w-32 bg-stone-200 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-stone-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-stone-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-stone-200 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-20 bg-stone-200 rounded"></div>
                    </td>
                  </tr>
                ))
              : filteredMenu.map((item) => (
                  <tr key={item._id} className="hover:bg-stone-50/50">
                    <td className="px-8 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden">
                        <img
                          src={item.img}
                          className="w-full h-full object-cover"
                          alt={item.name}
                        />
                      </div>
                      <span className="font-bold text-stone-800">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-800">
                      Rp {item.variants?.[0]?.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Sold Out"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-left space-x-2">
                      <button
                        onClick={() => {
                          setEditingData({ ...item });
                          setEditImagePreview(item.img || null);
                          setIsEditModalOpen(true);
                        }}
                        className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            show: true,
                            id: item._id!,
                            name: item.name,
                          })
                        }
                        className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View List Menu */}
      <div className="md:hidden space-y-4">
        {isLoadingMenu
          ? [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-stone-200 rounded-2xl shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                    <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                    <div className="h-4 bg-stone-200 rounded w-1/3 mt-2"></div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                  <div className="h-8 flex-1 bg-stone-200 rounded-xl"></div>
                  <div className="h-8 w-16 bg-stone-200 rounded-xl"></div>
                  <div className="h-8 w-16 bg-stone-200 rounded-xl"></div>
                </div>
              </div>
            ))
          : filteredMenu.map((item) => (
              <div
                key={item._id}
                className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-stone-100 rounded-2xl overflow-hidden shrink-0">
                    <img
                      src={item.img}
                      className="w-full h-full object-cover"
                      alt={item.name}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-xs text-stone-400">{item.category}</p>
                    <p className="text-amber-700 font-bold">
                      Rp {item.variants?.[0]?.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                  <button
                    onClick={() => toggleStatus(item)}
                    className={`flex-1 text-[10px] font-bold uppercase rounded-xl py-2 ${
                      item.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Sold Out"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingData({ ...item });
                      setEditImagePreview(item.img || null);
                      setIsEditModalOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      setDeleteModal({
                        show: true,
                        id: item._id!,
                        name: item.name,
                      })
                    }
                    className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
      </div>

      {/* --- MODALS (EDIT, DELETE, SUCCESS) --- */}
      {isEditModalOpen && editingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              <h2 className="text-2xl font-serif font-bold mb-6">Edit Menu</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingData.name}
                  onChange={(e) =>
                    setEditingData({ ...editingData, name: e.target.value })
                  }
                  className="w-full p-4 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600"
                />
                <textarea
                  value={editingData.desc}
                  rows={3}
                  onChange={(e) =>
                    setEditingData({ ...editingData, desc: e.target.value })
                  }
                  className="w-full p-4 bg-stone-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600"
                />
                <select
                  value={editingData.category}
                  onChange={(e) =>
                    setEditingData({
                      ...editingData,
                      category: e.target.value,
                    })
                  }
                  className="w-full p-4 bg-stone-50 rounded-2xl outline-none cursor-pointer"
                >
                  {categories
                .filter((c) => c !== "All")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
                <div className="bg-stone-50 p-5 rounded-3xl border border-stone-100">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block">
                Variant
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {editingData.variants.map((v, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={v.label}
                          onChange={(e) =>
                            handleVariantChange(
                              i,
                              "label",
                              e.target.value,
                              true
                            )
                          }
                          className="flex-1 p-3 bg-white rounded-xl text-sm border border-stone-200 focus:border-amber-500 outline-none"
                        />
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) =>
                            handleVariantChange(
                              i,
                              "price",
                              Number(e.target.value),
                              true
                            )
                          }
                          className="w-24 p-3 bg-white rounded-xl text-sm border border-stone-200 focus:border-amber-500 outline-none"
                        />
                        <button
                          onClick={() => modifyVariantCount("remove", i, true)}
                          disabled={editingData.variants.length === 1}
                          className="w-10 h-10 flex items-center justify-center bg-white border border-stone-200 text-stone-300 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-30"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      modifyVariantCount("add", undefined, true)
                    }
                    className="w-full mt-3 py-2 border-2 border-dashed border-stone-200 text-stone-400 rounded-xl text-xs font-bold hover:border-amber-400 hover:text-amber-600 transition-colors"
                  >
                    + Add Variant
                  </button>
                </div>
              </div>
            </div>

            {/* BAGIAN KANAN: PREVIEW GAMBAR & TOMBOL */}
            <div className="bg-stone-50 w-full md:w-80 p-6 md:p-8 flex flex-col justify-between border-l border-stone-100">
              <div>
                <div className="w-40 h-40 md:w-full md:h-auto md:aspect-square mx-auto rounded-3xl md:rounded-4xl bg-white overflow-hidden mb-6 md:mb-4 relative group border-4 border-white shadow-sm">
                  {editImagePreview ? (
                    <img
                      src={editImagePreview}
                      className="w-full h-full object-cover"
                      alt="Edit Preview"
                    />
                  ) : (
                    <div className="p-10 text-center italic text-stone-300 flex items-center justify-center h-full">
                      No Image
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-xs font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                      Change Photo
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "edit")}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleUpdateMenu}
                  className="w-full py-4 bg-[#2d241e] text-white rounded-2xl font-bold shadow-lg hover:bg-amber-900 active:scale-[0.98]"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full py-4 bg-white text-stone-500 rounded-2xl font-bold border border-stone-200 hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete & Success Modals */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-4xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold mb-2">Delete Menu?</h3>
            <p className="text-stone-500 mb-6 text-sm">
              Delete "{deleteModal.name}" permanently?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ show: false, id: "", name: "" })
                }
                className="flex-1 py-3 bg-stone-100 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white px-10 py-8 rounded-4xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">
              ✓
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-6">
              {successMessage}
            </h3>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-8 py-3 bg-stone-800 text-white rounded-xl font-bold text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {bulkModal.show && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-4xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold mb-4">Confirm Status</h3>
            <p className="text-stone-500 mb-6 text-sm">
              Change ALL menus to{" "}
              {bulkModal.targetStatus ? "Available" : "Sold Out"}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBulkModal({ ...bulkModal, show: false })}
                className="flex-1 py-3 bg-stone-100 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkStatus}
                className="flex-1 py-3 bg-[#2d241e] text-white rounded-xl font-bold"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}