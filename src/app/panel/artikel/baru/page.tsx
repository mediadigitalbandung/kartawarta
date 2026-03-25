"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Save,
  Send,
  Eye,
  ChevronDown,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor"),
  { ssr: false, loading: () => <div className="h-[500px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" /> }
);

const categories = [
  { id: "1", name: "Hukum Pidana" },
  { id: "2", name: "Hukum Perdata" },
  { id: "3", name: "Hukum Tata Negara" },
  { id: "4", name: "Hukum Bisnis" },
  { id: "5", name: "HAM" },
  { id: "6", name: "Hukum Lingkungan" },
  { id: "7", name: "Ketenagakerjaan" },
  { id: "8", name: "Opini" },
  { id: "9", name: "Infografis" },
  { id: "10", name: "Berita Bandung" },
];

interface Source {
  name: string;
  title: string;
  institution: string;
  url: string;
}

export default function NewArticlePage() {
  const router = useRouter();
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

  const addSource = () => {
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
    if (!content.trim() || content.length < 50) return setError("Konten minimal 50 karakter");
    if (!categoryId) return setError("Kategori wajib dipilih");

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

      router.push("/panel/artikel");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tulis Artikel Baru
          </h1>
          <p className="text-sm text-gray-500">
            Pastikan mengikuti standar jurnalistik
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubmit("DRAFT")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
          >
            <Save size={16} />
            Simpan Draft
          </button>
          <button
            onClick={() => handleSubmit("IN_REVIEW")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
          >
            <Send size={16} />
            Kirim untuk Review
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
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
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xl font-bold focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-800 dark:bg-gray-900"
          />

          {/* Editor */}
          <RichTextEditor content={content} onChange={setContent} />

          {/* Sources */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Sumber & Narasumber
              </h3>
              <button
                type="button"
                onClick={addSource}
                className="flex items-center gap-1 text-xs text-primary-500 hover:underline"
              >
                <Plus size={14} /> Tambah Sumber
              </button>
            </div>
            <div className="space-y-3">
              {sources.map((source, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <input
                    type="text"
                    placeholder="Nama narasumber *"
                    value={source.name}
                    onChange={(e) => updateSource(i, "name", e.target.value)}
                    className="rounded border border-gray-200 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="Jabatan"
                    value={source.title}
                    onChange={(e) => updateSource(i, "title", e.target.value)}
                    className="rounded border border-gray-200 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="Institusi"
                    value={source.institution}
                    onChange={(e) => updateSource(i, "institution", e.target.value)}
                    className="rounded border border-gray-200 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  />
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="URL referensi"
                      value={source.url}
                      onChange={(e) => updateSource(i, "url", e.target.value)}
                      className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                    />
                    {sources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSource(i)}
                        className="rounded p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
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
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Pengaturan SEO
              <ChevronDown size={16} className={showSeo ? "rotate-180" : ""} />
            </button>
            {showSeo && (
              <div className="space-y-3 border-t border-gray-200 px-4 py-3 dark:border-gray-800">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">SEO Title ({seoTitle.length}/70)</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    maxLength={70}
                    placeholder={title || "Judul untuk mesin pencari"}
                    className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Meta Description ({seoDescription.length}/160)</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    maxLength={160}
                    rows={2}
                    placeholder="Deskripsi singkat untuk hasil pencarian"
                    className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Category */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              Kategori *
            </h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
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
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">Tags</h3>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tag1, Tag2, Tag3"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            />
            <p className="mt-1 text-xs text-gray-400">Pisahkan dengan koma</p>
          </div>

          {/* Excerpt */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">Ringkasan</h3>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Ringkasan singkat artikel"
              maxLength={500}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          {/* Featured Image */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              Gambar Utama
            </h3>
            <input
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="URL gambar utama"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          {/* Verification Label */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              Label Verifikasi
            </h3>
            <select
              value={verificationLabel}
              onChange={(e) => setVerificationLabel(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="UNVERIFIED">Belum Diverifikasi</option>
              <option value="VERIFIED">Terverifikasi</option>
              <option value="OPINION">Opini</option>
              <option value="CORRECTION">Koreksi</option>
            </select>
          </div>

          {/* Journalism Checklist */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
            <button
              type="button"
              onClick={() => setShowChecklist(!showChecklist)}
              className="flex w-full items-center justify-between text-sm font-bold text-blue-800 dark:text-blue-300"
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
                  <label key={item.key} className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-400">
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
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
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
