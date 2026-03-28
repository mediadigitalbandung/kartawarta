"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Search,
  Shield,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  ShieldAlert,
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
  SUPER_ADMIN: { label: "Super Admin", color: "bg-red-50 text-red-600" },
  CHIEF_EDITOR: { label: "Editor Kepala", color: "bg-purple-50 text-purple-600" },
  EDITOR: { label: "Editor", color: "bg-blue-50 text-blue-600" },
  SENIOR_JOURNALIST: { label: "Jurnalis Senior", color: "bg-goto-light text-goto-green" },
  JOURNALIST: { label: "Jurnalis", color: "bg-blue-50 text-blue-600" },
  CONTRIBUTOR: { label: "Kontributor", color: "bg-surface-tertiary text-txt-secondary" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[12px] border border-border bg-surface shadow-card">
      <div className="border-b border-border bg-surface-secondary px-5 py-3">
        <div className="h-4 w-full rounded bg-surface-tertiary" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-3">
          <div className="h-9 w-9 rounded-full bg-surface-tertiary" />
          <div className="flex-1">
            <div className="h-4 w-1/3 rounded bg-surface-tertiary" />
            <div className="mt-1 h-3 w-1/4 rounded bg-surface-secondary" />
          </div>
          <div className="h-5 w-16 rounded-full bg-surface-tertiary" />
          <div className="h-4 w-8 rounded bg-surface-tertiary" />
          <div className="h-4 w-12 rounded bg-surface-tertiary" />
          <div className="h-4 w-20 rounded bg-surface-tertiary" />
        </div>
      ))}
    </div>
  );
}

export default function PenggunaPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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
    setEditingUser(null);
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setFormSpec(user.specialization || "");
    setShowModal(true);
  }

  async function handleSubmitUser(e: FormEvent) {
    e.preventDefault();

    if (!formName || !formEmail || !formRole) {
      alert("Nama, email, dan role wajib diisi.");
      return;
    }

    if (!editingUser && !formPassword) {
      alert("Password wajib diisi untuk pengguna baru.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingUser) {
        // Update existing user
        const body: Record<string, string | undefined> = {
          name: formName,
          email: formEmail,
          role: formRole,
          specialization: formSpec || undefined,
        };
        if (formPassword) {
          body.password = formPassword;
        }

        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Gagal mengupdate pengguna");
        }

        alert("Pengguna berhasil diperbarui");
      } else {
        // Create new user
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

        alert("Pengguna berhasil ditambahkan");
      }

      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan pengguna.");
      console.error("Save user error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      return;
    }

    try {
      setDeleting(id);
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus pengguna");
      }

      alert("Pengguna berhasil dihapus");
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

  if (session && session.user.role !== "SUPER_ADMIN" && session.user.role !== "CHIEF_EDITOR") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <ShieldAlert size={48} className="mb-4 text-red-400" />
        <h1 className="text-xl font-bold text-txt-primary">Akses Ditolak</h1>
        <p className="mt-2 text-sm text-txt-secondary">
          Halaman ini hanya dapat diakses oleh Super Admin atau Editor Kepala.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Kelola Pengguna</h1>
          <p className="text-sm text-txt-secondary">{users.length} pengguna terdaftar</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} />
          Tambah Pengguna
        </button>
      </div>

      <div className="mb-4 relative sm:max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
        <input
          type="text"
          placeholder="Cari pengguna..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full pl-9"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-[12px] border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          <p>{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 rounded-[12px] bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
            aria-label="Coba muat ulang daftar pengguna"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-secondary">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-txt-secondary">Pengguna</th>
                  <th className="px-5 py-3 text-left font-medium text-txt-secondary">Role</th>
                  <th className="px-5 py-3 text-left font-medium text-txt-secondary">Artikel</th>
                  <th className="px-5 py-3 text-left font-medium text-txt-secondary">Status</th>
                  <th className="px-5 py-3 text-left font-medium text-txt-secondary">Terdaftar</th>
                  <th className="px-5 py-3 text-right font-medium text-txt-secondary">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user) => {
                  const role = roleLabels[user.role] || { label: user.role, color: "bg-surface-tertiary text-txt-secondary" };
                  return (
                    <tr key={user.id} className="hover:bg-surface-secondary">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-goto-green text-sm font-bold text-white">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-txt-primary">{user.name}</p>
                            <p className="flex items-center gap-1 text-xs text-txt-secondary">
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
                      <td className="px-5 py-3 text-txt-secondary">
                        {user._count?.articles ?? 0}
                      </td>
                      <td className="px-5 py-3">
                        {user.isActive ? (
                          <span className="flex items-center gap-1 text-xs text-goto-green">
                            <UserCheck size={12} /> Aktif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-500">
                            <UserX size={12} /> Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-txt-secondary">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(user)}
                            className="btn-ghost rounded p-1"
                            title="Edit"
                            aria-label="Edit pengguna"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={deleting === user.id}
                            className="btn-ghost rounded p-1 hover:text-red-500 disabled:opacity-50"
                            title="Hapus"
                            aria-label="Hapus pengguna"
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
            <div className="py-12 text-center text-txt-secondary">
              Tidak ada pengguna ditemukan.
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-[12px] border border-border bg-surface p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-txt-primary">
              {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </h2>
            <form className="space-y-3" onSubmit={handleSubmitUser}>
              <input
                type="text"
                placeholder="Nama lengkap"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="input w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                className="input w-full"
              />
              <div>
                <input
                  type="password"
                  placeholder={editingUser ? "Password baru" : "Password (min. 8 karakter)"}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required={!editingUser}
                  minLength={8}
                  className="input w-full"
                  aria-label="Password"
                />
                {editingUser && (
                  <p className="mt-1 text-xs text-txt-muted">Kosongkan jika tidak ingin mengubah password</p>
                )}
              </div>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                required
                className="input w-full"
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
                className="input w-full"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : editingUser ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
