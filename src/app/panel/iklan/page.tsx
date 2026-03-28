"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import {
  Plus,
  Eye,
  MousePointer,
  BarChart3,
  Edit,
  Trash2,
  Power,
  Calendar,
} from "lucide-react";

interface Ad {
  id: string;
  name: string;
  type: string;
  slot: string;
  imageUrl?: string | null;
  htmlCode?: string | null;
  targetUrl?: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  priority: number;
}

const slotLabels: Record<string, string> = {
  HEADER: "Header Banner",
  SIDEBAR: "Sidebar",
  IN_ARTICLE: "Dalam Artikel",
  FOOTER: "Footer",
  BETWEEN_SECTIONS: "Antar Seksi",
  POPUP: "Pop-up",
  FLOATING_BOTTOM: "Floating Bottom",
};

const typeLabels: Record<string, string> = {
  IMAGE: "Gambar",
  GIF: "GIF Animasi",
  HTML: "Kode HTML",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
            <div className="h-4 w-24 rounded bg-surface-tertiary" />
            <div className="mt-2 h-7 w-16 rounded bg-surface-tertiary" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[12px] border border-border bg-surface shadow-card">
        <div className="border-b border-border bg-surface-secondary px-5 py-3">
          <div className="h-4 w-full rounded bg-surface-tertiary" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-3">
            <div className="h-4 w-1/4 rounded bg-surface-tertiary" />
            <div className="h-4 w-20 rounded bg-surface-tertiary" />
            <div className="h-4 w-32 rounded bg-surface-tertiary" />
            <div className="h-4 w-16 rounded bg-surface-tertiary" />
            <div className="h-4 w-12 rounded bg-surface-tertiary" />
            <div className="h-4 w-12 rounded bg-surface-tertiary" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IklanPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("IMAGE");
  const [formSlot, setFormSlot] = useState("HEADER");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formHtmlCode, setFormHtmlCode] = useState("");
  const [formTargetUrl, setFormTargetUrl] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/ads?all=true");
      if (!res.ok) {
        throw new Error("Gagal memuat iklan");
      }

      const json = await res.json();
      setAds(json.data || []);
    } catch (err) {
      setError("Gagal memuat daftar iklan. Silakan coba lagi.");
      console.error("Fetch ads error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  function resetForm() {
    setFormName("");
    setFormType("IMAGE");
    setFormSlot("HEADER");
    setFormImageUrl("");
    setFormHtmlCode("");
    setFormTargetUrl("");
    setFormStartDate("");
    setFormEndDate("");
    setEditingAd(null);
  }

  function openEditModal(ad: Ad) {
    setEditingAd(ad);
    setFormName(ad.name);
    setFormType(ad.type);
    setFormSlot(ad.slot);
    setFormImageUrl(ad.imageUrl || "");
    setFormHtmlCode(ad.htmlCode || "");
    setFormTargetUrl(ad.targetUrl || "");
    setFormStartDate(ad.startDate ? new Date(ad.startDate).toISOString().split("T")[0] : "");
    setFormEndDate(ad.endDate ? new Date(ad.endDate).toISOString().split("T")[0] : "");
    setShowModal(true);
  }

  async function handleSubmitAd(e: FormEvent) {
    e.preventDefault();

    if (!formName || !formStartDate || !formEndDate) {
      alert("Nama, tanggal mulai, dan tanggal selesai wajib diisi.");
      return;
    }

    if (!formType) {
      alert("Tipe iklan wajib dipilih.");
      return;
    }

    if (!formSlot) {
      alert("Posisi slot iklan wajib dipilih.");
      return;
    }

    try {
      setSubmitting(true);

      const body = {
        name: formName,
        type: formType,
        slot: formSlot,
        imageUrl: formImageUrl || null,
        htmlCode: formHtmlCode || null,
        targetUrl: formTargetUrl || null,
        startDate: new Date(formStartDate).toISOString(),
        endDate: new Date(formEndDate).toISOString(),
      };

      if (editingAd) {
        const res = await fetch(`/api/ads/${editingAd.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Gagal mengupdate iklan");
        }

        alert("Iklan berhasil diperbarui");
      } else {
        const res = await fetch("/api/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Gagal menambah iklan");
        }

        alert("Iklan berhasil ditambahkan");
      }

      setShowModal(false);
      resetForm();
      fetchAds();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan iklan.");
      console.error("Save ad error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus iklan ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    try {
      setDeleting(id);
      const res = await fetch(`/api/ads/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus iklan");
      }

      alert("Iklan berhasil dihapus");
      fetchAds();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus iklan.");
      console.error("Delete ad error:", err);
    } finally {
      setDeleting(null);
    }
  }

  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Kelola Iklan</h1>
          <p className="text-sm text-txt-secondary">Atur banner iklan di berbagai posisi</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} />
          Tambah Iklan
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-[12px] border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          <p>{error}</p>
          <button
            onClick={fetchAds}
            className="mt-2 rounded-[12px] bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
            aria-label="Coba muat ulang daftar iklan"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-sm text-txt-secondary">
                <Eye size={16} className="text-blue-500" /> Total Tayangan
              </div>
              <p className="mt-1 text-2xl font-bold text-txt-primary">
                {totalImpressions.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-sm text-txt-secondary">
                <MousePointer size={16} className="text-goto-green" /> Total Klik
              </div>
              <p className="mt-1 text-2xl font-bold text-txt-primary">
                {totalClicks.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-sm text-txt-secondary">
                <BarChart3 size={16} className="text-purple-500" /> Rata-rata CTR
              </div>
              <p className="mt-1 text-2xl font-bold text-txt-primary">{avgCtr}%</p>
            </div>
          </div>

          {/* Ads table */}
          <div className="overflow-hidden rounded-[12px] border border-border bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface-secondary">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Nama Iklan</th>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Posisi</th>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Periode</th>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Tayangan</th>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Klik</th>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">CTR</th>
                    <th className="px-5 py-3 text-left font-medium text-txt-secondary">Status</th>
                    <th className="px-5 py-3 text-right font-medium text-txt-secondary">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ads.map((ad) => {
                    const ctr = ad.impressions > 0
                      ? ((ad.clicks / ad.impressions) * 100).toFixed(2) + "%"
                      : "0.00%";
                    return (
                      <tr key={ad.id} className="hover:bg-surface-secondary">
                        <td className="px-5 py-3">
                          <p className="font-medium text-txt-primary">{ad.name}</p>
                          <p className="text-xs text-txt-muted">{typeLabels[ad.type] || ad.type}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-txt-secondary">
                            {slotLabels[ad.slot] || ad.slot}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-txt-secondary">
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar size={10} />
                            {formatDate(ad.startDate)} — {formatDate(ad.endDate)}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-txt-secondary">
                          {ad.impressions.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3 text-txt-secondary">
                          {ad.clicks.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3 font-bold text-txt-primary">{ctr}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ad.isActive ? "bg-goto-light text-goto-green" : "bg-red-50 text-red-600"}`}>
                            <Power size={10} />
                            {ad.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(ad)}
                              className="btn-ghost rounded p-1"
                              title="Edit"
                              aria-label="Edit iklan"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(ad.id, ad.name)}
                              disabled={deleting === ad.id}
                              className="btn-ghost rounded p-1 hover:text-red-500 disabled:opacity-50"
                              title="Hapus"
                              aria-label="Hapus iklan"
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

            {ads.length === 0 && (
              <div className="py-12 text-center text-txt-secondary">
                Belum ada iklan.
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Ad Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-[12px] border border-border bg-surface p-4 sm:p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-txt-primary">
              {editingAd ? "Edit Iklan" : "Tambah Iklan Baru"}
            </h2>
            <form className="space-y-3" onSubmit={handleSubmitAd}>
              <input
                type="text"
                placeholder="Nama iklan"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="input w-full"
              />
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="input w-full"
                aria-label="Tipe iklan"
              >
                <option value="IMAGE">Gambar</option>
                <option value="GIF">GIF Animasi</option>
                <option value="HTML">Kode HTML</option>
              </select>
              <select
                value={formSlot}
                onChange={(e) => setFormSlot(e.target.value)}
                className="input w-full"
              >
                {Object.entries(slotLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {formType !== "HTML" ? (
                <input
                  type="url"
                  placeholder="URL Gambar"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="input w-full"
                />
              ) : (
                <textarea
                  placeholder="Kode HTML"
                  value={formHtmlCode}
                  onChange={(e) => setFormHtmlCode(e.target.value)}
                  rows={3}
                  className="input w-full"
                />
              )}
              <input
                type="url"
                placeholder="URL Target (opsional)"
                value={formTargetUrl}
                onChange={(e) => setFormTargetUrl(e.target.value)}
                className="input w-full"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-txt-secondary">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    required
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-txt-secondary">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    required
                    className="input w-full"
                  />
                </div>
              </div>
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
                  {submitting ? "Menyimpan..." : editingAd ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
