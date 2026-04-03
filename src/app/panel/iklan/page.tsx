"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import {
  Plus,
  Eye,
  MousePointer,
  BarChart3,
  Edit,
  Trash2,
  Power,
  Calendar,
  ImageIcon,
  Info,
  ExternalLink,
  X,
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

const slotSpecs: Record<string, { width: number; height: number; ratio: string; desc: string }> = {
  HEADER: { width: 728, height: 90, ratio: "728 x 90 px", desc: "Leaderboard — tampil di atas halaman" },
  SIDEBAR: { width: 300, height: 250, ratio: "300 x 250 px", desc: "Medium Rectangle — sidebar kanan" },
  IN_ARTICLE: { width: 728, height: 90, ratio: "728 x 90 px", desc: "Leaderboard — di tengah artikel" },
  FOOTER: { width: 728, height: 90, ratio: "728 x 90 px", desc: "Leaderboard — di bawah halaman" },
  BETWEEN_SECTIONS: { width: 970, height: 250, ratio: "970 x 250 px", desc: "Billboard — antar seksi homepage" },
  POPUP: { width: 600, height: 400, ratio: "600 x 400 px", desc: "Large Rectangle — pop-up overlay" },
  FLOATING_BOTTOM: { width: 728, height: 90, ratio: "728 x 90 px", desc: "Leaderboard — floating di bawah" },
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
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Preview Overlay ─── */
function AdPreviewOverlay({
  slot,
  imageUrl,
  htmlCode,
  type,
  targetUrl,
  onClose,
}: {
  slot: string;
  imageUrl: string;
  htmlCode: string;
  type: string;
  targetUrl: string;
  onClose: () => void;
}) {
  const spec = slotSpecs[slot];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="relative max-w-[95vw] max-h-[90vh] overflow-auto bg-surface rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-surface border-b border-border px-5 py-3 rounded-t-2xl">
          <div>
            <h3 className="text-sm font-bold text-txt-primary">Preview Iklan — {slotLabels[slot]}</h3>
            <p className="text-xs text-txt-muted">{spec?.ratio} • {spec?.desc}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface-secondary">
            <X size={18} />
          </button>
        </div>

        {/* Simulated page context */}
        <div className="p-4 sm:p-6 bg-surface-secondary">
          {/* Context: simulated page */}
          {slot === "HEADER" || slot === "FLOATING_BOTTOM" || slot === "FOOTER" ? (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="rounded-lg bg-surface p-4 border border-border">
                <div className="h-3 w-48 rounded bg-surface-tertiary mb-2" />
                <div className="h-2 w-full rounded bg-surface-tertiary mb-1" />
                <div className="h-2 w-3/4 rounded bg-surface-tertiary" />
              </div>

              {/* AD SLOT */}
              <div className="relative border-2 border-dashed border-goto-green/40 rounded-lg overflow-hidden bg-surface">
                <div className="absolute top-1 left-2 z-10 rounded bg-goto-green/90 px-2 py-0.5 text-[10px] font-bold text-white">
                  IKLAN — {slotLabels[slot]}
                </div>
                <div className="flex items-center justify-center" style={{ minHeight: spec?.height || 90 }}>
                  {type !== "HTML" && imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="max-w-full h-auto object-contain" style={{ maxHeight: spec?.height || 90 }} />
                  ) : type === "HTML" && htmlCode ? (
                    <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-6 text-txt-muted">
                      <ImageIcon size={24} />
                      <span className="text-xs">Belum ada gambar</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-surface p-4 border border-border">
                <div className="h-3 w-36 rounded bg-surface-tertiary mb-2" />
                <div className="h-2 w-full rounded bg-surface-tertiary mb-1" />
                <div className="h-2 w-2/3 rounded bg-surface-tertiary" />
              </div>
            </div>
          ) : slot === "SIDEBAR" ? (
            <div className="max-w-4xl mx-auto flex gap-5">
              <div className="flex-1 space-y-3">
                <div className="rounded-lg bg-surface p-4 border border-border">
                  <div className="h-3 w-48 rounded bg-surface-tertiary mb-2" />
                  <div className="h-2 w-full rounded bg-surface-tertiary mb-1" />
                  <div className="h-2 w-full rounded bg-surface-tertiary mb-1" />
                  <div className="h-2 w-3/4 rounded bg-surface-tertiary" />
                </div>
                <div className="rounded-lg bg-surface p-4 border border-border">
                  <div className="h-2 w-full rounded bg-surface-tertiary mb-1" />
                  <div className="h-2 w-full rounded bg-surface-tertiary mb-1" />
                  <div className="h-2 w-2/3 rounded bg-surface-tertiary" />
                </div>
              </div>
              {/* SIDEBAR AD */}
              <div className="shrink-0 w-[300px]">
                <div className="relative border-2 border-dashed border-goto-green/40 rounded-lg overflow-hidden bg-surface">
                  <div className="absolute top-1 left-2 z-10 rounded bg-goto-green/90 px-2 py-0.5 text-[10px] font-bold text-white">
                    IKLAN — Sidebar
                  </div>
                  <div className="flex items-center justify-center" style={{ minHeight: 250 }}>
                    {type !== "HTML" && imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="max-w-full h-auto object-contain" style={{ maxHeight: 250 }} />
                    ) : type === "HTML" && htmlCode ? (
                      <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                    ) : (
                      <div className="flex flex-col items-center gap-1 py-8 text-txt-muted">
                        <ImageIcon size={24} />
                        <span className="text-xs">300 x 250 px</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : slot === "IN_ARTICLE" ? (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="rounded-lg bg-surface p-4 border border-border">
                <div className="h-4 w-64 rounded bg-surface-tertiary mb-3" />
                <div className="h-2 w-full rounded bg-surface-tertiary mb-1" />
                <div className="h-2 w-full rounded bg-surface-tertiary mb-1" />
                <div className="h-2 w-4/5 rounded bg-surface-tertiary mb-3" />
                <div className="h-2 w-full rounded bg-surface-tertiary mb-1" />
                <div className="h-2 w-full rounded bg-surface-tertiary" />
              </div>

              <div className="relative border-2 border-dashed border-goto-green/40 rounded-lg overflow-hidden bg-surface">
                <div className="absolute top-1 left-2 z-10 rounded bg-goto-green/90 px-2 py-0.5 text-[10px] font-bold text-white">
                  IKLAN — Dalam Artikel
                </div>
                <div className="flex items-center justify-center" style={{ minHeight: spec?.height || 90 }}>
                  {type !== "HTML" && imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="max-w-full h-auto object-contain" style={{ maxHeight: spec?.height || 90 }} />
                  ) : type === "HTML" && htmlCode ? (
                    <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-6 text-txt-muted">
                      <ImageIcon size={24} />
                      <span className="text-xs">Belum ada gambar</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-surface p-4 border border-border">
                <div className="h-2 w-full rounded bg-surface-tertiary mb-1" />
                <div className="h-2 w-full rounded bg-surface-tertiary mb-1" />
                <div className="h-2 w-3/4 rounded bg-surface-tertiary" />
              </div>
            </div>
          ) : slot === "BETWEEN_SECTIONS" ? (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="rounded-lg bg-surface p-4 border border-border">
                <div className="h-3 w-40 rounded bg-surface-tertiary mb-2" />
                <div className="flex gap-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 flex-1 rounded bg-surface-tertiary" />)}
                </div>
              </div>
              <div className="relative border-2 border-dashed border-goto-green/40 rounded-lg overflow-hidden bg-surface">
                <div className="absolute top-1 left-2 z-10 rounded bg-goto-green/90 px-2 py-0.5 text-[10px] font-bold text-white">
                  IKLAN — Antar Seksi
                </div>
                <div className="flex items-center justify-center" style={{ minHeight: spec?.height || 250 }}>
                  {type !== "HTML" && imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="max-w-full h-auto object-contain" style={{ maxHeight: spec?.height }} />
                  ) : type === "HTML" && htmlCode ? (
                    <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-10 text-txt-muted">
                      <ImageIcon size={28} />
                      <span className="text-xs">970 x 250 px</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-surface p-4 border border-border">
                <div className="h-3 w-40 rounded bg-surface-tertiary mb-2" />
                <div className="flex gap-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 flex-1 rounded bg-surface-tertiary" />)}
                </div>
              </div>
            </div>
          ) : (
            /* POPUP / default */
            <div className="max-w-2xl mx-auto">
              <div className="relative border-2 border-dashed border-goto-green/40 rounded-lg overflow-hidden bg-surface">
                <div className="absolute top-1 left-2 z-10 rounded bg-goto-green/90 px-2 py-0.5 text-[10px] font-bold text-white">
                  IKLAN — {slotLabels[slot]}
                </div>
                <div className="flex items-center justify-center" style={{ minHeight: spec?.height || 200 }}>
                  {type !== "HTML" && imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="max-w-full h-auto object-contain" style={{ maxHeight: spec?.height }} />
                  ) : type === "HTML" && htmlCode ? (
                    <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-10 text-txt-muted">
                      <ImageIcon size={28} />
                      <span className="text-xs">{spec?.ratio || "Belum ada gambar"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {targetUrl && (
            <p className="mt-3 text-center text-xs text-txt-muted">
              Klik mengarah ke: <span className="text-goto-green font-medium">{targetUrl}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IklanPage() {
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("IMAGE");
  const [formSlot, setFormSlot] = useState("HEADER");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formHtmlCode, setFormHtmlCode] = useState("");
  const [formTargetUrl, setFormTargetUrl] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/ads?all=true");
      if (!res.ok) throw new Error("Gagal memuat iklan");
      const json = await res.json();
      setAds(json.data || []);
    } catch (err) {
      setError("Gagal memuat daftar iklan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  function resetForm() {
    setFormName(""); setFormType("IMAGE"); setFormSlot("HEADER");
    setFormImageUrl(""); setFormHtmlCode(""); setFormTargetUrl("");
    setFormStartDate(""); setFormEndDate(""); setEditingAd(null);
  }

  function openEditModal(ad: Ad) {
    setEditingAd(ad);
    setFormName(ad.name); setFormType(ad.type); setFormSlot(ad.slot);
    setFormImageUrl(ad.imageUrl || ""); setFormHtmlCode(ad.htmlCode || "");
    setFormTargetUrl(ad.targetUrl || "");
    setFormStartDate(ad.startDate ? new Date(ad.startDate).toISOString().split("T")[0] : "");
    setFormEndDate(ad.endDate ? new Date(ad.endDate).toISOString().split("T")[0] : "");
    setShowModal(true);
  }

  async function handleSubmitAd(e: FormEvent) {
    e.preventDefault();
    if (!formName || !formStartDate || !formEndDate) { showError("Nama, tanggal mulai, dan tanggal selesai wajib diisi."); return; }

    try {
      setSubmitting(true);
      const body = {
        name: formName, type: formType, slot: formSlot,
        imageUrl: formImageUrl || null, htmlCode: formHtmlCode || null,
        targetUrl: formTargetUrl || null,
        startDate: new Date(formStartDate).toISOString(),
        endDate: new Date(formEndDate).toISOString(),
      };

      if (editingAd) {
        const res = await fetch(`/api/ads/${editingAd.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) { const json = await res.json(); throw new Error(json.error || "Gagal mengupdate iklan"); }
        success("Iklan berhasil diperbarui");
      } else {
        const res = await fetch("/api/ads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) { const json = await res.json(); throw new Error(json.error || "Gagal menambah iklan"); }
        success("Iklan berhasil ditambahkan");
      }
      setShowModal(false); resetForm(); fetchAds();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal menyimpan iklan.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({ message: "Apakah Anda yakin ingin menghapus iklan ini?", variant: "danger", title: "Konfirmasi" });
    if (!ok) return;
    try {
      setDeleting(id);
      const res = await fetch(`/api/ads/${id}`, { method: "DELETE" });
      if (!res.ok) { const json = await res.json(); throw new Error(json.error || "Gagal menghapus iklan"); }
      success("Iklan berhasil dihapus"); fetchAds();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal menghapus iklan.");
    } finally {
      setDeleting(null);
    }
  }

  const totalPages = Math.ceil(ads.length / ITEMS_PER_PAGE);
  const paginatedAds = ads.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  const currentSpec = slotSpecs[formSlot];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-txt-primary">Kelola Iklan</h1>
          <p className="text-base text-txt-secondary">Atur banner iklan di berbagai posisi</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">
          <Plus size={16} /> Tambah Iklan
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-[12px] border border-red-200 bg-red-50 p-4 text-center text-base text-red-700">
          <p>{error}</p>
          <button onClick={fetchAds} className="mt-2 rounded-[12px] bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Coba Lagi</button>
        </div>
      )}

      {loading ? <LoadingSkeleton /> : (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-sm text-txt-secondary"><Eye size={16} className="text-blue-500" /> Total Tayangan</div>
              <p className="mt-1 text-lg sm:text-2xl font-bold text-txt-primary">{totalImpressions.toLocaleString("id-ID")}</p>
            </div>
            <div className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-sm text-txt-secondary"><MousePointer size={16} className="text-goto-green" /> Total Klik</div>
              <p className="mt-1 text-lg sm:text-2xl font-bold text-txt-primary">{totalClicks.toLocaleString("id-ID")}</p>
            </div>
            <div className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-sm text-txt-secondary"><BarChart3 size={16} className="text-purple-500" /> Rata-rata CTR</div>
              <p className="mt-1 text-lg sm:text-2xl font-bold text-txt-primary">{avgCtr}%</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-[12px] border border-border bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface-secondary">
                  <tr>
                    <th className="px-3 sm:px-5 py-3.5 text-left text-sm font-medium text-txt-secondary">Nama Iklan</th>
                    <th className="px-3 sm:px-5 py-3.5 text-left text-sm font-medium text-txt-secondary">Posisi</th>
                    <th className="hidden md:table-cell px-5 py-3.5 text-left text-sm font-medium text-txt-secondary">Periode</th>
                    <th className="hidden sm:table-cell px-5 py-3.5 text-left text-sm font-medium text-txt-secondary">Tayangan</th>
                    <th className="hidden sm:table-cell px-5 py-3.5 text-left text-sm font-medium text-txt-secondary">Klik</th>
                    <th className="hidden lg:table-cell px-5 py-3.5 text-left text-sm font-medium text-txt-secondary">CTR</th>
                    <th className="px-3 sm:px-5 py-3.5 text-left text-sm font-medium text-txt-secondary">Status</th>
                    <th className="px-3 sm:px-5 py-3.5 text-right text-sm font-medium text-txt-secondary">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedAds.map((ad) => {
                    const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) + "%" : "0.00%";
                    return (
                      <tr key={ad.id} className="hover:bg-surface-secondary">
                        <td className="px-3 sm:px-5 py-4">
                          <p className="font-medium text-txt-primary text-sm">{ad.name}</p>
                          <p className="text-xs text-txt-muted">{typeLabels[ad.type] || ad.type}</p>
                        </td>
                        <td className="px-3 sm:px-5 py-4">
                          <span className="rounded bg-surface-tertiary px-3 py-0.5 text-sm font-medium text-txt-secondary">{slotLabels[ad.slot] || ad.slot}</span>
                        </td>
                        <td className="hidden md:table-cell px-5 py-4 text-txt-secondary">
                          <div className="flex items-center gap-1 text-sm"><Calendar size={12} /> {formatDate(ad.startDate)} — {formatDate(ad.endDate)}</div>
                        </td>
                        <td className="hidden sm:table-cell px-5 py-4 text-sm text-txt-secondary">{ad.impressions.toLocaleString("id-ID")}</td>
                        <td className="hidden sm:table-cell px-5 py-4 text-sm text-txt-secondary">{ad.clicks.toLocaleString("id-ID")}</td>
                        <td className="hidden lg:table-cell px-5 py-4 text-sm font-bold text-txt-primary">{ctr}</td>
                        <td className="px-3 sm:px-5 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-sm font-medium ${ad.isActive ? "bg-goto-light text-goto-green" : "bg-red-50 text-red-600"}`}>
                            <Power size={10} /> {ad.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditModal(ad)} className="btn-ghost rounded p-2" title="Edit"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(ad.id)} disabled={deleting === ad.id} className="btn-ghost rounded p-2 hover:text-red-500 disabled:opacity-50" title="Hapus"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {paginatedAds.length === 0 && <div className="py-12 text-center text-base text-txt-secondary">Belum ada iklan.</div>}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-base text-txt-secondary">Halaman {page} dari {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary px-5 py-2.5 text-base disabled:opacity-40">Sebelumnya</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-secondary px-5 py-2.5 text-base disabled:opacity-40">Selanjutnya</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Modal Form ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-lg">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-6 py-4 rounded-t-2xl">
              <h2 className="text-lg font-bold text-txt-primary">{editingAd ? "Edit Iklan" : "Tambah Iklan Baru"}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="rounded-lg p-1.5 hover:bg-surface-secondary"><X size={18} /></button>
            </div>

            <form className="p-6 space-y-5" onSubmit={handleSubmitAd}>
              <input type="text" placeholder="Nama iklan" value={formName} onChange={(e) => setFormName(e.target.value)} required className="input w-full" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-txt-secondary">Tipe Iklan</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)} className="input w-full">
                    <option value="IMAGE">Gambar</option>
                    <option value="GIF">GIF Animasi</option>
                    <option value="HTML">Kode HTML</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-txt-secondary">Posisi Slot</label>
                  <select value={formSlot} onChange={(e) => setFormSlot(e.target.value)} className="input w-full">
                    {Object.entries(slotLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Visual Slot Guide ── */}
              {currentSpec && (
                <div className="rounded-xl border border-border bg-surface-secondary p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={14} className="text-goto-green" />
                    <span className="text-sm font-bold text-txt-primary">Posisi & Ukuran: {slotLabels[formSlot]}</span>
                  </div>
                  {/* Mini wireframe */}
                  <div className="relative rounded-lg border-2 border-border bg-surface p-2 text-[9px] text-txt-muted font-medium overflow-hidden" style={{ minHeight: 180 }}>
                    {/* Header */}
                    <div className={`rounded h-5 mb-1 flex items-center justify-center ${formSlot === "HEADER" ? "bg-goto-green/20 border-2 border-dashed border-goto-green text-goto-green font-bold text-[10px]" : "bg-surface-tertiary"}`}>
                      {formSlot === "HEADER" ? `IKLAN (${currentSpec.ratio})` : "Header"}
                    </div>
                    {/* Nav */}
                    <div className="rounded h-3 bg-surface-tertiary mb-1.5" />
                    {/* Body */}
                    <div className="flex gap-1.5 mb-1.5">
                      {/* Content area */}
                      <div className="flex-1 space-y-1">
                        <div className={`rounded h-4 ${formSlot === "BETWEEN_SECTIONS" ? "bg-goto-green/20 border-2 border-dashed border-goto-green flex items-center justify-center text-goto-green font-bold text-[10px]" : "bg-surface-tertiary"}`}>
                          {formSlot === "BETWEEN_SECTIONS" && `IKLAN (${currentSpec.ratio})`}
                        </div>
                        <div className="rounded h-8 bg-surface-tertiary" />
                        <div className={`rounded h-4 ${formSlot === "IN_ARTICLE" ? "bg-goto-green/20 border-2 border-dashed border-goto-green flex items-center justify-center text-goto-green font-bold text-[10px]" : "bg-surface-tertiary"}`}>
                          {formSlot === "IN_ARTICLE" && `IKLAN (${currentSpec.ratio})`}
                        </div>
                        <div className="rounded h-8 bg-surface-tertiary" />
                      </div>
                      {/* Sidebar */}
                      <div className={`shrink-0 w-16 rounded ${formSlot === "SIDEBAR" ? "bg-goto-green/20 border-2 border-dashed border-goto-green flex items-center justify-center text-goto-green font-bold text-[10px] p-1 text-center leading-tight" : "bg-surface-tertiary"}`}>
                        {formSlot === "SIDEBAR" && `IKLAN\n${currentSpec.ratio}`}
                      </div>
                    </div>
                    {/* Footer */}
                    <div className={`rounded h-5 mb-1 flex items-center justify-center ${formSlot === "FOOTER" ? "bg-goto-green/20 border-2 border-dashed border-goto-green text-goto-green font-bold text-[10px]" : "bg-surface-tertiary"}`}>
                      {formSlot === "FOOTER" ? `IKLAN (${currentSpec.ratio})` : "Footer"}
                    </div>
                    {/* Floating / Popup overlay */}
                    {formSlot === "FLOATING_BOTTOM" && (
                      <div className="absolute bottom-2 left-2 right-2 rounded bg-goto-green/20 border-2 border-dashed border-goto-green h-5 flex items-center justify-center text-goto-green font-bold text-[10px]">
                        IKLAN FLOATING ({currentSpec.ratio})
                      </div>
                    )}
                    {formSlot === "POPUP" && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
                        <div className="rounded-lg bg-goto-green/20 border-2 border-dashed border-goto-green px-4 py-6 text-goto-green font-bold text-[10px] text-center">
                          POP-UP IKLAN<br />{currentSpec.ratio}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-txt-muted">{currentSpec.desc}</p>
                    <span className="rounded-full bg-goto-light px-2.5 py-0.5 text-xs font-bold text-goto-green">{currentSpec.ratio}</span>
                  </div>
                </div>
              )}

              {/* ── Image Upload / URL ── */}
              {formType !== "HTML" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-txt-secondary">Gambar Iklan</label>
                  {/* Upload button */}
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 hover:border-goto-green hover:bg-goto-light/30 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                        <ImageIcon size={18} className="text-txt-muted" />
                        <span className="text-sm font-medium text-txt-secondary">
                          {uploading ? "Mengupload..." : "Upload Gambar"}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) { showError("Ukuran file maksimal 5MB"); return; }
                          try {
                            setUploading(true);
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Upload gagal"); }
                            const json = await res.json();
                            setFormImageUrl(json.data?.url || "");
                            success("Gambar berhasil diupload");
                          } catch (err) {
                            showError(err instanceof Error ? err.message : "Upload gagal");
                          } finally {
                            setUploading(false);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                  </div>
                  {/* Or paste URL */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-txt-muted font-medium">atau paste URL</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <input type="url" placeholder="https://contoh.com/banner.jpg" value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} className="input w-full text-sm" />
                  {/* Inline preview */}
                  {formImageUrl && (
                    <div className="rounded-xl border border-border bg-surface-secondary p-3 overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-txt-secondary">Preview Gambar</p>
                        <button type="button" onClick={() => setFormImageUrl("")} className="text-xs text-red-400 hover:text-red-600">Hapus</button>
                      </div>
                      <div className="rounded-lg overflow-hidden bg-[repeating-conic-gradient(#f0f1f3_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] flex items-center justify-center p-2">
                        <img
                          src={formImageUrl}
                          alt="Preview"
                          className="max-w-full h-auto rounded object-contain"
                          style={{ maxHeight: Math.min(currentSpec?.height || 200, 300) }}
                          onError={(e) => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).alt = "Gagal memuat gambar"; }}
                        />
                      </div>
                      {currentSpec && (
                        <p className="mt-1.5 text-[10px] text-txt-muted text-center">
                          Rekomendasi: {currentSpec.width} x {currentSpec.height} piksel
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <textarea placeholder="Kode HTML" value={formHtmlCode} onChange={(e) => setFormHtmlCode(e.target.value)} rows={4} className="input w-full font-mono text-sm" />
                  {formHtmlCode && (
                    <div className="mt-2 rounded-lg border border-border bg-surface-secondary p-2 overflow-hidden">
                      <p className="text-[10px] font-medium text-txt-muted mb-1">Preview HTML:</p>
                      <div dangerouslySetInnerHTML={{ __html: formHtmlCode }} />
                    </div>
                  )}
                </div>
              )}

              <input type="url" placeholder="URL Target (opsional)" value={formTargetUrl} onChange={(e) => setFormTargetUrl(e.target.value)} className="input w-full" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-txt-secondary">Tanggal Mulai</label>
                  <input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} required className="input w-full" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-txt-secondary">Tanggal Selesai</label>
                  <input type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} required className="input w-full" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-goto-green hover:text-goto-dark transition-colors"
                >
                  <Eye size={15} /> Preview di Halaman
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary px-4 py-2 text-sm">Batal</button>
                  <button type="submit" disabled={submitting} className="btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-50">
                    {submitting ? "Menyimpan..." : editingAd ? "Simpan" : "Tambah"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Full Page Preview Overlay ─── */}
      {showPreview && (
        <AdPreviewOverlay
          slot={formSlot}
          imageUrl={formImageUrl}
          htmlCode={formHtmlCode}
          type={formType}
          targetUrl={formTargetUrl}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
