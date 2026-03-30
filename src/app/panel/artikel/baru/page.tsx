"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import {
  Save,
  Send,
  ChevronDown,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
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

import { CAN_SUBMIT_REVIEW } from "@/lib/roles";

export default function NewArticlePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
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
  const [sources, setSources] = useState<Source[]>([{ name: "", title: "", institution: "", url: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSeo, setShowSeo] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showAutosaveBanner, setShowAutosaveBanner] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  const templates = [
    {
      name: "Berita Sidang",
      icon: "\u2696\uFE0F",
      desc: "Liputan persidangan hukum",
      content: `<h2>Kronologi Perkara</h2><p>[Jelaskan latar belakang kasus dan kronologi peristiwa]</p><h2>Dakwaan & Tuntutan</h2><p>[Uraikan dakwaan jaksa penuntut umum]</p><h2>Pembelaan Terdakwa</h2><p>[Sampaikan argumen dari pihak terdakwa/kuasa hukum]</p><h2>Putusan Hakim</h2><p>[Tuliskan putusan majelis hakim]</p><h2>Tanggapan</h2><p>[Respons dari pihak-pihak terkait]</p>`,
    },
    {
      name: "Investigasi",
      icon: "\uD83D\uDD0D",
      desc: "Liputan investigasi mendalam",
      content: `<h2>Latar Belakang</h2><p>[Konteks dan alasan investigasi dilakukan]</p><h2>Temuan Utama</h2><p>[Hasil investigasi dan bukti-bukti yang ditemukan]</p><h2>Bukti Pendukung</h2><p>[Data, dokumen, dan saksi yang mendukung temuan]</p><h2>Dampak</h2><p>[Dampak terhadap masyarakat dan pihak terkait]</p><h2>Respons Pihak Terkait</h2><p>[Tanggapan dari pihak yang menjadi subjek investigasi]</p>`,
    },
    {
      name: "Opini Hukum",
      icon: "\uD83D\uDCDD",
      desc: "Analisis dan pendapat hukum",
      content: `<h2>Pendahuluan</h2><p>[Latar belakang isu hukum yang dibahas]</p><h2>Dasar Hukum</h2><p>[Rujukan undang-undang, pasal, dan regulasi terkait]</p><h2>Analisis</h2><p>[Pembahasan mendalam dari perspektif hukum]</p><h2>Perbandingan</h2><p>[Perbandingan dengan kasus atau regulasi lain jika relevan]</p><h2>Kesimpulan</h2><p>[Rangkuman dan rekomendasi]</p>`,
    },
    {
      name: "Breaking News",
      icon: "\uD83D\uDEA8",
      desc: "Berita terkini singkat",
      content: `<p><strong>[KOTA, TANGGAL]</strong> — [Paragraf pembuka: Apa yang terjadi, siapa yang terlibat, di mana, kapan]</p><p>[Paragraf 2: Detail tambahan dan konteks]</p><p>[Paragraf 3: Kutipan dari narasumber terkait]</p><p>[Paragraf 4: Latar belakang atau informasi tambahan]</p><p><em>Berita ini akan terus diperbarui seiring perkembangan terbaru.</em></p>`,
    },
    {
      name: "Profil Hukum",
      icon: "\uD83D\uDC64",
      desc: "Profil tokoh atau lembaga hukum",
      content: `<h2>Latar Belakang</h2><p>[Riwayat hidup dan pendidikan]</p><h2>Karir & Jabatan</h2><p>[Perjalanan karir di bidang hukum]</p><h2>Kontribusi</h2><p>[Kontribusi penting dalam dunia hukum]</p><h2>Pandangan</h2><p>[Pandangan dan pemikiran terkait isu hukum]</p><h2>Penutup</h2><p>[Kesimpulan dan relevansi saat ini]</p>`,
    },
  ];

  // Word counter calculations
  const plainText = content.replace(/<[^>]*>/g, "").trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const AUTOSAVE_KEY = "autosave_draft_new";

  // Check for auto-saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        setShowAutosaveBanner(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Auto-save every 30 seconds (only for drafts)
  useEffect(() => {
    autosaveTimerRef.current = setInterval(() => {
      if (title.trim() || content.trim()) {
        try {
          const draft = { title, content, categoryId, excerpt, tags, featuredImage, sources };
          localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
        } catch {
          // localStorage not available
        }
      }
    }, 30000);

    return () => {
      if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
    };
  }, [title, content, categoryId, excerpt, tags, featuredImage, sources]);

  function loadAutosaveDraft() {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title) setTitle(draft.title);
        if (draft.content) setContent(draft.content);
        if (draft.categoryId) setCategoryId(draft.categoryId);
        if (draft.excerpt) setExcerpt(draft.excerpt);
        if (draft.tags) setTags(draft.tags);
        if (draft.featuredImage) setFeaturedImage(draft.featuredImage);
        if (draft.sources) setSources(draft.sources);
      }
    } catch {
      // ignore
    }
    setShowAutosaveBanner(false);
  }

  function discardAutosaveDraft() {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch {
      // ignore
    }
    setShowAutosaveBanner(false);
  }

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

  const handleSubmit = async (status: "DRAFT" | "IN_REVIEW") => {
    setError("");

    if (!title.trim()) return setError("Judul wajib diisi");
    if (!content.trim()) return setError("Konten tidak boleh kosong");
    if (content.length < 50) return setError("Konten minimal 50 karakter");
    if (!categoryId) return setError("Kategori harus dipilih");

    if (status === "IN_REVIEW" && !allChecked) {
      setShowChecklist(true);
      return setError("Semua checklist jurnalistik harus dipenuhi sebelum submit");
    }

    // Confirmation dialog for review submission
    if (status === "IN_REVIEW") {
      const ok = await confirm({ message: "Artikel akan dikirim untuk review oleh editor. Lanjutkan?", variant: "warning", title: "Konfirmasi" });
      if (!ok) {
        return;
      }
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
          sources: validSources.length > 0 ? validSources : undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Gagal menyimpan artikel");
        setSaving(false);
        return;
      }

      // Clear auto-save after successful creation
      try { localStorage.removeItem(AUTOSAVE_KEY); } catch { /* ignore */ }
      success(status === "IN_REVIEW" ? "Artikel berhasil dikirim untuk review" : "Artikel berhasil disimpan sebagai draf");
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
          {/* Save Draft */}
          <button
            onClick={() => handleSubmit("DRAFT")}
            disabled={saving}
            className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            <Save size={16} />
            Simpan Draf
          </button>
          {/* Submit for review */}
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
        </div>
      </div>

      {/* Auto-save recovery banner */}
      {showAutosaveBanner && (
        <div className="mb-4 flex items-center gap-3 rounded-[12px] border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="flex-1">Ada draf tersimpan otomatis. Muat draf?</span>
          <button
            onClick={loadAutosaveDraft}
            className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white hover:bg-yellow-600"
          >
            Muat
          </button>
          <button
            onClick={discardAutosaveDraft}
            className="rounded-full border border-yellow-400 px-3 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100"
          >
            Abaikan
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Template Selector */}
      {showTemplates && !content && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-txt-primary">Pilih Template Artikel</h3>
            <button onClick={() => setShowTemplates(false)} className="text-sm text-txt-muted hover:text-txt-primary">Lewati</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {templates.map((t) => (
              <button
                key={t.name}
                onClick={() => { setContent(t.content); setShowTemplates(false); }}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-border p-4 text-center transition-all hover:border-goto-green hover:bg-goto-50"
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="text-sm font-semibold text-txt-primary">{t.name}</span>
                <span className="text-xs text-txt-muted">{t.desc}</span>
              </button>
            ))}
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
            <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-sm text-txt-muted">
              <span>{wordCount} kata</span>
              <span className="text-border">|</span>
              <span>{charCount} karakter</span>
              <span className="text-border">|</span>
              <span>{readTime} menit baca</span>
            </div>
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
