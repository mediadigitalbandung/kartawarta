"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Settings, Save, CheckCircle } from "lucide-react";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  emailRedaksi: string;
  alamatRedaksi: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  articlesPerPage: number;
  enableComments: boolean;
  autoModerateComments: boolean;
}

const defaultSettings: SiteSettings = {
  siteName: "Jurnalis Hukum Bandung",
  siteDescription:
    "Portal berita hukum terpercaya di Bandung. Menyajikan berita hukum pidana, perdata, tata negara, HAM, dan analisis hukum yang akurat dan terverifikasi.",
  emailRedaksi: "redaksi@jurnalishukumbandung.id",
  alamatRedaksi: "Jl. Bandung, Jawa Barat, Indonesia",
  metaTitle: "Jurnalis Hukum Bandung - Media Hukum Digital Terpercaya",
  metaDescription:
    "Portal berita hukum terpercaya di Bandung. Menyajikan berita hukum pidana, perdata, tata negara, HAM, dan analisis hukum yang akurat dan terverifikasi.",
  keywords:
    "berita hukum, hukum bandung, jurnalis hukum, berita hukum bandung, hukum pidana, hukum perdata",
  articlesPerPage: 12,
  enableComments: true,
  autoModerateComments: false,
};

const STORAGE_KEY = "jhb_site_settings";

export default function PengaturanPage() {
  const { data: session, status: sessionStatus } = useSession();
  const userRole = session?.user?.role || "";

  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [toast, setToast] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Redirect non-super-admin
  if (sessionStatus !== "loading" && session && userRole !== "SUPER_ADMIN") {
    redirect("/panel/dashboard");
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {
      // Ignore parse errors
    }
    setLoaded(true);
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const updateField = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (sessionStatus === "loading" || !loaded) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-goto-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-20 z-50 flex items-center gap-2 rounded-[12px] border border-goto-green/20 bg-goto-50 px-5 py-3 shadow-lg">
          <CheckCircle size={18} className="text-goto-green" />
          <span className="text-sm font-medium text-goto-green">
            Pengaturan berhasil disimpan
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Settings size={24} className="text-goto-green" />
          <h1 className="text-2xl font-bold text-txt-primary">
            Pengaturan Sistem
          </h1>
        </div>
        <p className="mt-1 text-sm text-txt-secondary">
          Kelola konfigurasi umum website
        </p>
      </div>

      <div className="space-y-6">
        {/* Informasi Website */}
        <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-txt-primary">
            Informasi Website
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-primary">
                Nama Website
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => updateField("siteName", e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-primary">
                Deskripsi
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) =>
                  updateField("siteDescription", e.target.value)
                }
                rows={3}
                className="input resize-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-primary">
                Email Redaksi
              </label>
              <input
                type="email"
                value={settings.emailRedaksi}
                onChange={(e) => updateField("emailRedaksi", e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-primary">
                Alamat Redaksi
              </label>
              <textarea
                value={settings.alamatRedaksi}
                onChange={(e) =>
                  updateField("alamatRedaksi", e.target.value)
                }
                rows={2}
                className="input resize-none"
              />
            </div>
          </div>
        </div>

        {/* SEO Default */}
        <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-txt-primary">
            SEO Default
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-primary">
                Meta Title
              </label>
              <input
                type="text"
                value={settings.metaTitle}
                onChange={(e) => updateField("metaTitle", e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-primary">
                Meta Description
              </label>
              <textarea
                value={settings.metaDescription}
                onChange={(e) =>
                  updateField("metaDescription", e.target.value)
                }
                rows={3}
                className="input resize-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-primary">
                Keywords
              </label>
              <input
                type="text"
                value={settings.keywords}
                onChange={(e) => updateField("keywords", e.target.value)}
                className="input"
                placeholder="Pisahkan dengan koma"
              />
            </div>
          </div>
        </div>

        {/* Pengaturan Konten */}
        <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-txt-primary">
            Pengaturan Konten
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-primary">
                Jumlah artikel per halaman
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={settings.articlesPerPage}
                onChange={(e) =>
                  updateField(
                    "articlesPerPage",
                    parseInt(e.target.value) || 12
                  )
                }
                className="input w-32"
              />
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-border bg-surface-secondary px-4 py-3">
              <div>
                <p className="text-sm font-medium text-txt-primary">
                  Aktifkan komentar
                </p>
                <p className="text-xs text-txt-muted">
                  Izinkan pembaca meninggalkan komentar pada artikel
                </p>
              </div>
              <button
                role="switch"
                aria-checked={settings.enableComments}
                onClick={() =>
                  updateField("enableComments", !settings.enableComments)
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  settings.enableComments ? "bg-goto-green" : "bg-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    settings.enableComments
                      ? "translate-x-[22px]"
                      : "translate-x-0.5"
                  } mt-0.5`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-border bg-surface-secondary px-4 py-3">
              <div>
                <p className="text-sm font-medium text-txt-primary">
                  Moderasi komentar otomatis
                </p>
                <p className="text-xs text-txt-muted">
                  Komentar harus disetujui sebelum ditampilkan
                </p>
              </div>
              <button
                role="switch"
                aria-checked={settings.autoModerateComments}
                onClick={() =>
                  updateField(
                    "autoModerateComments",
                    !settings.autoModerateComments
                  )
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  settings.autoModerateComments ? "bg-goto-green" : "bg-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    settings.autoModerateComments
                      ? "translate-x-[22px]"
                      : "translate-x-0.5"
                  } mt-0.5`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} className="btn-primary">
          <Save size={16} />
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}
