"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  specialization?: string;
  _count?: { articles: number };
}

const roleLabels: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "bg-red-100 text-red-700" },
  CHIEF_EDITOR: { label: "Editor Kepala", color: "bg-purple-100 text-purple-700" },
  EDITOR: { label: "Editor", color: "bg-blue-100 text-blue-700" },
  SENIOR_JOURNALIST: { label: "Jurnalis Senior", color: "bg-green-100 text-green-700" },
  JOURNALIST: { label: "Jurnalis", color: "bg-teal-100 text-teal-700" },
  CONTRIBUTOR: { label: "Kontributor", color: "bg-gray-100 text-gray-700" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/50">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-1 h-3 w-1/4 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

export default function PenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formSpec, setFormSpec] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/users");
      if (!res.ok) {
        throw new Error("Gagal memuat pengguna");
      }

      const json = await res.json();
      setUsers(json.data || []);
    } catch (err) {
      setError("Gagal memuat daftar pengguna. Silakan coba lagi.");
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("");
    setFormSpec("");
  }

  async function handleAddUser(e: FormEvent) {
    e.preventDefault();

    if (!formName || !formEmail || !formPassword || !formRole) {
      alert("Semua field wajib diisi (kecuali spesialisasi).");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          specialization: formSpec || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menambah pengguna");
      }

      alert("Pengguna berhasil ditambahkan.");
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menambah pengguna.");
      console.error("Add user error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Yakin ingin menghapus pengguna "${name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    try {
      setDeleting(id);
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus pengguna");
      }

      alert("Pengguna berhasil dihapus.");
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus pengguna.");
      console.error("Delete user error:", err);
    } finally {
      setDeleting(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Pengguna</h1>
          <p className="text-sm text-gray-500">{users.length} pengguna terdaftar</p>
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

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
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
                  const role = roleLabels[user.role] || { label: user.role, color: "bg-gray-100 text-gray-700" };
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
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                        {user._count?.articles ?? 0}
                      </td>
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
                      <td className="px-5 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-yellow-500" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={deleting === user.id}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 disabled:opacity-50"
                            title="Hapus"
                          >
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

          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              Tidak ada pengguna ditemukan.
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Tambah Pengguna Baru</h2>
            <form className="space-y-3" onSubmit={handleAddUser}>
              <input
                type="text"
                placeholder="Nama lengkap"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <input
                type="email"
                placeholder="Email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <input
                type="password"
                placeholder="Password (min. 8 karakter)"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="">Pilih Role</option>
                {Object.entries(roleLabels).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Spesialisasi (opsional)"
                value={formSpec}
                onChange={(e) => setFormSpec(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
