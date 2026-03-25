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
  HEADER: "Header (728x90)",
  SIDEBAR: "Sidebar (300x250)",
  IN_ARTICLE: "In-Article",
  FOOTER: "Footer",
  POPUP: "Popup",
  FLOATING_BOTTOM: "Floating Bottom",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-7 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/50">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-gray-100 px-5 py-3 dark:border-gray-800">
            <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700" />
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
  }

  async function handleAddAd(e: FormEvent) {
    e.preventDefault();

    if (!formName || !formStartDate || !formEndDate) {
      alert("Nama, tanggal mulai, dan tanggal selesai wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          type: formType,
          slot: formSlot,
          imageUrl: formImageUrl || null,
          htmlCode: formHtmlCode || null,
          targetUrl: formTargetUrl || null,
          startDate: new Date(formStartDate).toISOString(),
          endDate: new Date(formEndDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menambah iklan");
      }

      alert("Iklan berhasil ditambahkan.");
      setShowModal(false);
      resetForm();
      fetchAds();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menambah iklan.");
      console.error("Add ad error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Yakin ingin menghapus iklan "${name}"?`)) {
      return;
    }

    try {
      setDeleting(id);
      const res = await fetch(`/api/ads/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus iklan");
      }

      alert("Iklan berhasil dihapus.");
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Iklan</h1>
          <p className="text-sm text-gray-500">Atur banner iklan di berbagai posisi</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          <Plus size={16} />
          Tambah Iklan
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye size={16} className="text-blue-500" /> Total Impressions
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {totalImpressions.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MousePointer size={16} className="text-green-500" /> Total Clicks
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {totalClicks.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BarChart3 size={16} className="text-purple-500" /> Avg. CTR
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{avgCtr}%</p>
            </div>
          </div>

          {/* Ads table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Nama Iklan</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Posisi</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Periode</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Impressions</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Clicks</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">CTR</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {ads.map((ad) => {
                    const ctr = ad.impressions > 0
                      ? ((ad.clicks / ad.impressions) * 100).toFixed(2) + "%"
                      : "0.00%";
                    return (
                      <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{ad.name}</p>
                          <p className="text-xs text-gray-400">{ad.type}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            {slotLabels[ad.slot] || ad.slot}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar size={10} />
                            {formatDate(ad.startDate)} — {formatDate(ad.endDate)}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                          {ad.impressions.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                          {ad.clicks.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{ctr}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ad.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            <Power size={10} />
                            {ad.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-yellow-500" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(ad.id, ad.name)}
                              disabled={deleting === ad.id}
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

            {ads.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                Belum ada iklan.
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Ad Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Tambah Iklan Baru</h2>
            <form className="space-y-3" onSubmit={handleAddAd}>
              <input
                type="text"
                placeholder="Nama iklan"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="IMAGE">IMAGE</option>
                <option value="GIF">GIF</option>
                <option value="HTML">HTML</option>
              </select>
              <select
                value={formSlot}
                onChange={(e) => setFormSlot(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              ) : (
                <textarea
                  placeholder="Kode HTML"
                  value={formHtmlCode}
                  onChange={(e) => setFormHtmlCode(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              )}
              <input
                type="url"
                placeholder="URL Target (opsional)"
                value={formTargetUrl}
                onChange={(e) => setFormTargetUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>
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
