"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  Save,
  Send,
  ChevronDown,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  XCircle,
  Upload,
  MessageSquare,
  User,
  Calendar,
} from "lucide-react";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor"),
  { ssr: false, loading: () => <div className="h-[500px] animate-pulse rounded-[12px] bg-surface-secondary" /> }
);

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Source {
  name: string;
  title: string;
  institution: string;
  url: string;
}

const EDITOR_ROLES = ["EDITOR", "CHIEF_EDITOR", "SUPER_ADMIN"];
const CAN_PUBLISH_DIRECTLY = ["SUPER_ADMIN", "CHIEF_EDITOR", "SENIOR_JOURNALIST"];
const CAN_SUBMIT_REVIEW = ["SUPER_ADMIN", "CHIEF_EDITOR", "EDITOR", "SENIOR_JOURNALIST", "JOURNALIST"];

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-7 w-48 rounded bg-surface-tertiary" />
          <div className="mt-2 h-4 w-64 rounded bg-surface-secondary" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 rounded-[12px] bg-surface-tertiary" />
          <div className="h-10 w-40 rounded-[12px] bg-surface-tertiary" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-14 rounded-[12px] bg-surface-tertiary" />
          <div className="h-[500px] rounded-[12px] bg-surface-tertiary" />
          <div className="h-40 rounded-[12px] bg-surface-tertiary" />
        </div>
        <div className="space-y-4">
          <div className="h-24 rounded-[12px] bg-surface-tertiary" />
          <div className="h-24 rounded-[12px] bg-surface-tertiary" />
          <div className="h-32 rounded-[12px] bg-surface-tertiary" />
          <div className="h-24 rounded-[12px] bg-surface-tertiary" />
          <div className="h-24 rounded-[12px] bg-surface-tertiary" />
        </div>
      </div>
    </div>
  );
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const { data: session } = useSession();
  const userRole = session?.user?.role || "";
  const isEditor = EDITOR_ROLES.includes(userRole);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [verificationLabel, setVerificationLabel] = useState("UNVERIFIED");
  const [sources, setSources] = useState<Source[]>([{ name: "", title: "", institution: "", url: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSeo, setShowSeo] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentStatus, setCurrentStatus] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [existingReviewNote, setExistingReviewNote] = useState("");
  const [existingReviewedBy, setExistingReviewedBy] = useState("");
  const [existingReviewedAt, setExistingReviewedAt] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  const [checklist, setChecklist] = useState({
    notClickbait: false,
    hasSource: false,
    balanced: false,
    noSara: false,
    properLanguage: false,
  });

  const allChecked = Object.values(checklist).every(Boolean);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch {
      console.error("Failed to fetch categories");
    }
  }, []);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/articles/${articleId}`);
      if (res.status === 404) {
        setError("Artikel tidak ditemukan");
        return;
      }
      if (!res.ok) {
        setError("Gagal memuat artikel");
        return;
      }
      const json = await res.json();
      const article = json.data;

      setTitle(article.title || "");
      setContent(article.content || "");
      setExcerpt(article.excerpt || "");
      setCategoryId(article.categoryId || article.category?.id || "");
      setTags(article.tags?.map((t: { name: string }) => t.name).join(", ") || "");
      setFeaturedImage(article.featuredImage || "");
      setSeoTitle(article.seoTitle || "");
      setSeoDescription(article.seoDescription || "");
      setVerificationLabel(article.verificationLabel || "UNVERIFIED");
      setCurrentStatus(article.status || "DRAFT");
      setExistingReviewNote(article.reviewNote || "");
      setExistingReviewedBy(article.reviewedBy || "");
      setExistingReviewedAt(article.reviewedAt || "");

      if (article.sources && article.sources.length > 0) {
        setSources(
          article.sources.map((s: { name?: string; title?: string; institution?: string; url?: string }) => ({
            name: s.name || "",
            title: s.title || "",
            institution: s.institution || "",
            url: s.url || "",
          }))
        );
      }
    } catch {
      setError("Terjadi kesalahan saat memuat artikel.");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchCategories();
    fetchArticle();
  }, [fetchCategories, fetchArticle]);

  const addSource = () => {
    if (sources.length > 0 && !sources[sources.length - 1].name.trim()) {
      return;
    }
    setSources([...sources, { name: "", title: "", institution: "", url: "" }]);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const updateSource = (index: number, field: keyof Source, value: string) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    setSources(updated);
  };

  const handleSubmit = async (status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "APPROVED" | "REJECTED") => {
    setError("");

    if (!title.trim()) return setError("Judul wajib diisi");
    if (!content.trim()) return setError("Konten tidak boleh kosong");
    if (content.length < 50) return setError("Konten minimal 50 karakter");
    if (!categoryId) return setError("Kategori harus dipilih");

    if (status === "REJECTED" && !rejectNote.trim()) {
      return setError("Alasan penolakan wajib diisi");
    }

    if (!["DRAFT", "APPROVED", "REJECTED"].includes(status) && !allChecked) {
      setShowChecklist(true);
      return setError("Semua checklist jurnalistik harus dipenuhi sebelum submit");
    }

    setSaving(true);

    try {
      const validSources = sources.filter((s) => s.name.trim());
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const body: Record<string, unknown> = {
        title,
        content,
        excerpt: excerpt || undefined,
        categoryId,
        tags: tagList,
        featuredImage: featuredImage || undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        status,
        verificationLabel,
        sources: validSources.length > 0 ? validSources : undefined,
      };

      // Add review note for approve/reject
      if (status === "APPROVED") {
        body.reviewNote = reviewNote || null;
      } else if (status === "REJECTED") {
        body.reviewNote = rejectNote;
      }

      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Gagal menyimpan artikel");
        setSaving(false);
        return;
      }

      const statusMessages: Record<string, string> = {
        APPROVED: "Artikel berhasil disetujui",
        REJECTED: "Artikel telah ditolak",
        PUBLISHED: "Artikel berhasil dipublikasi",
        DRAFT: "Artikel disimpan sebagai draf",
        IN_REVIEW: "Artikel dikirim untuk review",
      };
      alert(statusMessages[status] || "Artikel berhasil diperbarui");
      router.push("/panel/artikel");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error && !title) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <AlertCircle size={48} className="mb-4 text-red-400" />
        <h1 className="text-xl font-bold text-txt-primary">{error}</h1>
        <button
          onClick={() => router.push("/panel/artikel")}
          className="btn-primary mt-4 flex items-center gap-2 px-4 py-2 text-sm font-semibold"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Artikel
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/panel/artikel")}
            className="mb-1 flex items-center gap-1 text-xs text-txt-secondary hover:text-txt-primary"
          >
            <ArrowLeft size={14} /> Kembali ke Daftar Artikel
          </button>
          <h1 className="text-2xl font-bold text-txt-primary">
            Edit Artikel
          </h1>
          <p className="text-sm text-txt-secondary">
            Status saat ini: <span className="font-medium text-gold">{
              { DRAFT: "Draf", IN_REVIEW: "Menunggu Review", APPROVED: "Disetujui", PUBLISHED: "Dipublikasi", REJECTED: "Ditolak", ARCHIVED: "Diarsipkan" }[currentStatus] || currentStatus.replace(/_/g, " ")
            }</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Save Draft - always available */}
          <button
            onClick={() => handleSubmit("DRAFT")}
            disabled={saving}
            className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            <Save size={16} />
            Simpan Draf
          </button>
          {/* Submit for review - not for editors reviewing, not for contributors */}
          {CAN_SUBMIT_REVIEW.includes(userRole) && !isEditor && (
            <button
              onClick={() => handleSubmit("IN_REVIEW")}
              disabled={saving}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              <Send size={16} />
              Kirim untuk Review
            </button>
          )}
          {/* Publish directly for senior editors */}
          {CAN_PUBLISH_DIRECTLY.includes(userRole) && (
            <button
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-[12px] bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload size={16} />
              Publikasi Langsung
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Review note from previous rejection - shown to article creator */}
      {currentStatus === "REJECTED" && existingReviewNote && (
        <div className="mb-4 rounded-[12px] border border-red-200 bg-red-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-red-700">
            <XCircle size={16} />
            Artikel Ditolak
          </h3>
          <p className="mt-2 text-sm text-red-600">{existingReviewNote}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-red-400">
            {existingReviewedBy && (
              <span className="flex items-center gap-1">
                <User size={12} />
                Reviewer: {existingReviewedBy}
              </span>
            )}
            {existingReviewedAt && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(existingReviewedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Review info for approved articles */}
      {currentStatus === "APPROVED" && existingReviewedAt && (
        <div className="mb-4 rounded-[12px] border border-blue-200 bg-blue-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <CheckCircle size={16} />
            Artikel Disetujui
          </h3>
          {existingReviewNote && (
            <p className="mt-2 text-sm text-blue-600">{existingReviewNote}</p>
          )}
          <div className="mt-2 flex items-center gap-4 text-xs text-blue-400">
            {existingReviewedBy && (
              <span className="flex items-center gap-1">
                <User size={12} />
                Reviewer: {existingReviewedBy}
              </span>
            )}
            {existingReviewedAt && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(existingReviewedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Editor Review Panel - shown when article is IN_REVIEW and user is editor */}
      {isEditor && currentStatus === "IN_REVIEW" && (
        <div className="mb-6 rounded-[12px] border-2 border-yellow-300 bg-yellow-50 p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-yellow-800">
            <MessageSquare size={18} />
            Panel Review Editor
          </h3>
          <p className="mt-1 text-sm text-yellow-600">
            Artikel ini menunggu review. Silakan periksa dan pilih aksi di bawah.
          </p>

          {/* Optional review note for approval */}
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-yellow-800">
              Catatan Review (opsional untuk persetujuan)
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={2}
              placeholder="Catatan untuk penulis..."
              className="input w-full text-sm"
            />
          </div>

          {/* Rejection reason */}
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-red-700">
              Alasan Penolakan (wajib jika menolak)
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={2}
              placeholder="Jelaskan alasan penolakan..."
              className="input w-full text-sm border-red-200"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => handleSubmit("APPROVED")}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-[12px] bg-goto-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-goto-dark disabled:opacity-50"
            >
              <CheckCircle size={16} />
              Setujui
            </button>
            <button
              onClick={() => handleSubmit("REJECTED")}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-[12px] bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle size={16} />
              Tolak
            </button>
            {CAN_PUBLISH_DIRECTLY.includes(userRole) && (
              <button
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-[12px] bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload size={16} />
                Publikasi Langsung
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main editor */}
        <div className="space-y-4 lg:col-span-2">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul Artikel"
            className="input w-full px-4 py-3 text-xl font-bold"
          />

          {/* Editor */}
          <div className="rounded-[12px] border border-border overflow-hidden">
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          {/* Sources */}
          <div className="rounded-[12px] border border-border bg-surface p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-txt-primary uppercase tracking-wider">
                Sumber & Narasumber
              </h3>
              <button
                type="button"
                onClick={addSource}
                className="flex items-center gap-1 text-xs text-goto-green hover:underline"
              >
                <Plus size={14} /> Tambah Sumber
              </button>
            </div>
            <div className="space-y-3">
              {sources.map((source, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-[12px] border border-border p-3">
                  <input
                    type="text"
                    placeholder="Nama narasumber *"
                    value={source.name}
                    onChange={(e) => updateSource(i, "name", e.target.value)}
                    className="input text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Jabatan"
                    value={source.title}
                    onChange={(e) => updateSource(i, "title", e.target.value)}
                    className="input text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Institusi"
                    value={source.institution}
                    onChange={(e) => updateSource(i, "institution", e.target.value)}
                    className="input text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="URL referensi"
                      value={source.url}
                      onChange={(e) => updateSource(i, "url", e.target.value)}
                      className="input flex-1 text-sm"
                    />
                    {sources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSource(i)}
                        className="rounded p-1.5 text-red-400 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Settings */}
          <div className="rounded-[12px] border border-border bg-surface">
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium text-txt-primary uppercase tracking-wider"
            >
              Pengaturan SEO
              <ChevronDown size={16} className={showSeo ? "rotate-180" : ""} />
            </button>
            {showSeo && (
              <div className="space-y-3 border-t border-border px-6 py-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-txt-primary">SEO Title ({seoTitle.length}/70)</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    maxLength={70}
                    placeholder={title || "Judul untuk mesin pencari"}
                    className="input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-txt-primary">Meta Description ({seoDescription.length}/160)</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    maxLength={160}
                    rows={2}
                    placeholder="Deskripsi singkat untuk hasil pencarian"
                    className="input w-full text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Category */}
          <div className="rounded-[12px] border border-border bg-surface p-6">
            <label className="mb-2 block text-sm font-medium text-txt-primary">
              Kategori *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input w-full"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="rounded-[12px] border border-border bg-surface p-6">
            <label className="mb-2 block text-sm font-medium text-txt-primary">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tag1, Tag2, Tag3"
              className="input w-full"
            />
            <p className="mt-1 text-xs text-txt-muted">Pisahkan dengan koma</p>
          </div>

          {/* Excerpt */}
          <div className="rounded-[12px] border border-border bg-surface p-6">
            <label className="mb-2 block text-sm font-medium text-txt-primary">Ringkasan</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Ringkasan singkat artikel"
              maxLength={500}
              className="input w-full"
            />
          </div>

          {/* Featured Image */}
          <div className="rounded-[12px] border border-border bg-surface p-6">
            <label className="mb-2 block text-sm font-medium text-txt-primary">
              Gambar Utama
            </label>
            <input
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="URL gambar utama"
              className="input w-full"
            />
          </div>

          {/* Verification Label */}
          <div className="rounded-[12px] border border-border bg-surface p-6">
            <label className="mb-2 block text-sm font-medium text-txt-primary">
              Label Verifikasi
            </label>
            <select
              value={verificationLabel}
              onChange={(e) => setVerificationLabel(e.target.value)}
              className="input w-full"
              aria-label="Label verifikasi artikel"
            >
              <option value="UNVERIFIED">Belum Diverifikasi — Belum dicek kebenarannya</option>
              <option value="VERIFIED">Terverifikasi — Fakta sudah dikonfirmasi</option>
              <option value="OPINION">Opini — Artikel berisi pendapat penulis</option>
              <option value="CORRECTION">Koreksi — Perbaikan atas artikel sebelumnya</option>
            </select>
          </div>

          {/* Journalism Checklist */}
          <div className="rounded-[12px] border border-goto-green/20 bg-goto-50 p-4">
            <button
              type="button"
              onClick={() => setShowChecklist(!showChecklist)}
              className="flex w-full items-center justify-between text-sm font-bold text-goto-dark"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle size={16} />
                Checklist Jurnalistik
              </span>
              <ChevronDown size={14} className={showChecklist ? "rotate-180" : ""} />
            </button>
            {showChecklist && (
              <div className="mt-3 space-y-2">
                {[
                  { key: "notClickbait" as const, label: "Judul tidak clickbait / sensasional berlebihan" },
                  { key: "hasSource" as const, label: "Minimal 1 sumber terverifikasi" },
                  { key: "balanced" as const, label: "Cover both sides (perspektif berimbang)" },
                  { key: "noSara" as const, label: "Tidak mengandung unsur SARA" },
                  { key: "properLanguage" as const, label: "Bahasa sesuai PUEBI" },
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-2 text-xs text-goto-green">
                    <input
                      type="checkbox"
                      checked={checklist[item.key]}
                      onChange={(e) =>
                        setChecklist({ ...checklist, [item.key]: e.target.checked })
                      }
                      className="mt-0.5 rounded"
                    />
                    {item.label}
                  </label>
                ))}
                {allChecked && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-goto-green">
                    <CheckCircle size={12} /> Semua checklist terpenuhi
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
