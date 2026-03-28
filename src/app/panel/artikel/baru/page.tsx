"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Upload,
  Sparkles,
  Loader2,
} from "lucide-react";
import ImageUploader from "@/components/editor/ImageUploader";

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

const CAN_SUBMIT_REVIEW = ["SUPER_ADMIN", "CHIEF_EDITOR", "EDITOR", "SENIOR_JOURNALIST", "JOURNALIST"];
const CAN_PUBLISH_DIRECTLY = ["SUPER_ADMIN", "CHIEF_EDITOR", "SENIOR_JOURNALIST"];

export default function NewArticlePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "";

  const [categories, setCategories] = useState<Category[]>([]);
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

  const [checklist, setChecklist] = useState({
    notClickbait: false,
    hasSource: false,
    balanced: false,
    noSara: false,
    properLanguage: false,
  });

  const allChecked = Object.values(checklist).every(Boolean);

  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  const generateAI = async (feature: string, setter: (val: string) => void) => {
    if (!title.trim() || !content.trim()) return;
    setAiLoading((prev) => ({ ...prev, [feature]: true }));
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, title, content }),
      });
      const data = await res.json();
      if (data.success && data.data?.result) {
        setter(data.data.result);
      } else {
        setError(data.error || "Gagal generate AI");
      }
    } catch {
      setError("Gagal menghubungi AI service");
    } finally {
      setAiLoading((prev) => ({ ...prev, [feature]: false }));
    }
  };

  const AiButton = ({ feature, setter }: { feature: string; setter: (val: string) => void }) => (
    <button
      type="button"
      onClick={() => generateAI(feature, setter)}
      disabled={!title.trim() || !content.trim() || aiLoading[feature]}
      className="flex items-center gap-1 text-xs text-goto-green hover:underline disabled:opacity-40 disabled:no-underline"
    >
      {aiLoading[feature] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
      Generate AI
    </button>
  );

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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  const handleSubmit = async (status: "DRAFT" | "IN_REVIEW" | "PUBLISHED") => {
    setError("");

    if (!title.trim()) return setError("Judul wajib diisi");
    if (!content.trim()) return setError("Konten tidak boleh kosong");
    if (content.length < 50) return setError("Konten minimal 50 karakter");
    if (!categoryId) return setError("Kategori harus dipilih");

    if (status !== "DRAFT" && !allChecked) {
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

      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Gagal menyimpan artikel");
        setSaving(false);
        return;
      }

      alert("Artikel berhasil disimpan");
      router.push("/panel/artikel");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-txt-primary">
            Tulis Artikel Baru
          </h1>
          <p className="text-sm text-txt-secondary">
            Pastikan mengikuti standar jurnalistik
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* All roles: Save Draft */}
          <button
            onClick={() => handleSubmit("DRAFT")}
            disabled={saving}
            className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            <Save size={16} />
            Simpan Draf
          </button>
          {/* All except CONTRIBUTOR: Submit for review */}
          {CAN_SUBMIT_REVIEW.includes(userRole) && (
            <button
              onClick={() => handleSubmit("IN_REVIEW")}
              disabled={saving}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              <Send size={16} />
              Kirim untuk Review
            </button>
          )}
          {/* Senior editors/admins: Publish directly */}
          {CAN_PUBLISH_DIRECTLY.includes(userRole) && (
            <button
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-[12px] bg-goto-green px-4 py-2 text-sm font-semibold text-white hover:bg-goto-green/90 disabled:opacity-50"
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
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-sm font-medium text-txt-primary">SEO Title ({seoTitle.length}/70)</label>
                    <AiButton feature="seo_title" setter={setSeoTitle} />
                  </div>
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
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-sm font-medium text-txt-primary">Meta Description ({seoDescription.length}/160)</label>
                    <AiButton feature="meta_description" setter={setSeoDescription} />
                  </div>
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
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-txt-primary">Tags</label>
              <AiButton feature="tags" setter={setTags} />
            </div>
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
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-txt-primary">Ringkasan</label>
              <AiButton feature="summary" setter={setExcerpt} />
            </div>
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
            <ImageUploader
              onUpload={(url: string) => setFeaturedImage(url)}
              currentImage={featuredImage}
            />
            <div className="mt-2">
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="Atau paste URL gambar"
                className="input w-full text-xs"
              />
            </div>
            {featuredImage && !featuredImage.startsWith("data:") && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={featuredImage}
                alt="Preview"
                className="mt-2 w-full rounded-[8px] object-cover"
                style={{ maxHeight: 200 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
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
