"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Save,
  X,
  Users,
} from "lucide-react";

interface RedaksiMember {
  id: string;
  position: string;
  name: string;
  desc: string | null;
  photo: string | null;
  order: number;
  isActive: boolean;
}

const emptyForm = { position: "", name: "", desc: "", photo: "", order: 0, isActive: true };

export default function RedaksiPanelPage() {
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const [members, setMembers] = useState<RedaksiMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/redaksi");
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      setMembers(json.data || []);
    } catch {
      showError("Gagal memuat susunan redaksi");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, order: members.length });
    setShowForm(true);
  }

  function openEdit(m: RedaksiMember) {
    setEditingId(m.id);
    setForm({ position: m.position, name: m.name, desc: m.desc || "", photo: m.photo || "", order: m.order, isActive: m.isActive });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.position || !form.name) { showError("Jabatan dan nama wajib diisi"); return; }

    try {
      setSubmitting(true);
      const url = editingId ? `/api/redaksi/${editingId}` : "/api/redaksi";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: form.position,
          name: form.name,
          desc: form.desc || null,
          photo: form.photo || null,
          order: form.order,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Gagal menyimpan"); }
      success(editingId ? "Berhasil diperbarui" : "Berhasil ditambahkan");
      closeForm();
      fetchMembers();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    const ok = await confirm({ message: `Hapus "${name}" dari susunan redaksi?`, variant: "danger", title: "Konfirmasi" });
    if (!ok) return;
    try {
      const res = await fetch(`/api/redaksi/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      success("Berhasil dihapus");
      fetchMembers();
    } catch {
      showError("Gagal menghapus anggota redaksi");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-txt-primary">Susunan Redaksi</h1>
          <p className="text-base text-txt-secondary">Kelola susunan redaksi yang tampil di halaman publik</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">
          <Plus size={16} /> Tambah Anggota
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-txt-primary">{editingId ? "Edit Anggota" : "Tambah Anggota Baru"}</h2>
            <button onClick={closeForm} className="p-1 hover:bg-surface-secondary rounded-lg"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-txt-secondary">Jabatan *</label>
                <input type="text" placeholder="Contoh: Pemimpin Redaksi" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required className="input w-full" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-txt-secondary">Nama *</label>
                <input type="text" placeholder="Nama lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input w-full" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-secondary">Deskripsi</label>
              <input type="text" placeholder="Tugas dan tanggung jawab" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className="input w-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-txt-secondary">URL Foto</label>
                <input type="url" placeholder="https://..." value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} className="input w-full" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-txt-secondary">Urutan</label>
                <input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="input w-full" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-txt-secondary">Status</label>
                <select value={form.isActive ? "true" : "false"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })} className="input w-full">
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeForm} className="btn-secondary px-5 py-2.5 text-sm">Batal</button>
              <button type="submit" disabled={submitting} className="btn-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-50">
                <Save size={14} className="mr-1.5" />
                {submitting ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
              <div className="flex gap-4"><div className="h-12 w-12 rounded-full bg-surface-tertiary" /><div className="flex-1 space-y-2"><div className="h-4 w-32 rounded bg-surface-tertiary" /><div className="h-3 w-48 rounded bg-surface-tertiary" /></div></div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-[12px] border-2 border-dashed border-border py-16 text-center">
          <Users size={40} className="mx-auto text-txt-muted mb-3" />
          <p className="text-txt-muted text-base">Belum ada anggota redaksi.</p>
          <button onClick={openAdd} className="mt-3 btn-primary px-4 py-2 text-sm"><Plus size={14} className="mr-1" /> Tambah Anggota Pertama</button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m, i) => (
            <div key={m.id} className="rounded-[12px] border border-border bg-surface p-4 sm:p-5 shadow-card flex items-center gap-4 hover:shadow-card-hover transition-all">
              <GripVertical size={16} className="text-txt-muted shrink-0 hidden sm:block" />
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-goto-green text-lg font-bold text-white">
                {m.photo ? (
                  <img src={m.photo} alt={m.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  m.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-goto-green">{m.position}</p>
                <p className="font-bold text-txt-primary text-base">{m.name}</p>
                {m.desc && <p className="text-sm text-txt-muted truncate">{m.desc}</p>}
              </div>
              <span className="text-xs text-txt-muted hidden sm:block">#{m.order}</span>
              {!m.isActive && (
                <span className="rounded-full bg-red-50 text-red-600 px-2.5 py-0.5 text-xs font-medium">Nonaktif</span>
              )}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(m)} className="btn-ghost rounded p-2" title="Edit"><Edit size={16} /></button>
                <button onClick={() => handleDelete(m.id, m.name)} className="btn-ghost rounded p-2 hover:text-red-500" title="Hapus"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
