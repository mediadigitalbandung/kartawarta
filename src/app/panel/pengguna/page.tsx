"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Shield,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
} from "lucide-react";

const roleLabels: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "bg-red-100 text-red-700" },
  CHIEF_EDITOR: { label: "Editor Kepala", color: "bg-purple-100 text-purple-700" },
  EDITOR: { label: "Editor", color: "bg-blue-100 text-blue-700" },
  SENIOR_JOURNALIST: { label: "Jurnalis Senior", color: "bg-green-100 text-green-700" },
  JOURNALIST: { label: "Jurnalis", color: "bg-teal-100 text-teal-700" },
  CONTRIBUTOR: { label: "Kontributor", color: "bg-gray-100 text-gray-700" },
};

const demoUsers = [
  { id: "1", name: "Super Admin", email: "admin@jurnalishukumbandung.com", role: "SUPER_ADMIN", isActive: true, articles: 0, createdAt: "1 Jan 2026" },
  { id: "2", name: "Editor Kepala", email: "editor@jurnalishukumbandung.com", role: "CHIEF_EDITOR", isActive: true, articles: 12, createdAt: "5 Jan 2026" },
  { id: "3", name: "Ahmad Fauzi", email: "ahmad@jurnalishukumbandung.com", role: "SENIOR_JOURNALIST", isActive: true, articles: 45, createdAt: "10 Jan 2026" },
  { id: "4", name: "Siti Nurhaliza", email: "siti@jurnalishukumbandung.com", role: "JOURNALIST", isActive: true, articles: 32, createdAt: "15 Jan 2026" },
  { id: "5", name: "Rizky Ramadhan", email: "rizky@jurnalishukumbandung.com", role: "JOURNALIST", isActive: true, articles: 28, createdAt: "20 Jan 2026" },
  { id: "6", name: "Dewi Kartika", email: "dewi@jurnalishukumbandung.com", role: "JOURNALIST", isActive: false, articles: 15, createdAt: "1 Feb 2026" },
  { id: "7", name: "Budi Santoso", email: "budi@jurnalishukumbandung.com", role: "CONTRIBUTOR", isActive: true, articles: 8, createdAt: "10 Feb 2026" },
];

export default function PenggunaPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = demoUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Pengguna</h1>
          <p className="text-sm text-gray-500">{demoUsers.length} pengguna terdaftar</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          <Plus size={16} />
          Tambah Pengguna
        </button>
      </div>

      <div className="mb-4 relative sm:max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari pengguna..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Pengguna</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Artikel</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Terdaftar</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((user) => {
                const role = roleLabels[user.role];
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail size={10} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${role.color}`}>
                        <Shield size={10} /> {role.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{user.articles}</td>
                    <td className="px-5 py-3">
                      {user.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <UserCheck size={12} /> Aktif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <UserX size={12} /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{user.createdAt}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-yellow-500" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Tambah Pengguna Baru</h2>
            <form className="space-y-3">
              <input type="text" placeholder="Nama lengkap" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
              <input type="email" placeholder="Email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
              <input type="password" placeholder="Password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
                <option value="">Pilih Role</option>
                {Object.entries(roleLabels).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <input type="text" placeholder="Spesialisasi (opsional)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">Batal</button>
                <button type="submit" className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
