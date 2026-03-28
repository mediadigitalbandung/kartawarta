"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserCircle, Save, Loader2 } from "lucide-react";

const roleLabelsMap: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  CHIEF_EDITOR: "Editor Kepala",
  EDITOR: "Editor",
  SENIOR_JOURNALIST: "Jurnalis Senior",
  JOURNALIST: "Jurnalis",
  CONTRIBUTOR: "Kontributor",
};

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  bio: string | null;
  specialization: string | null;
  avatar: string | null;
  createdAt: string;
  _count: { articles: number };
}

export default function ProfilPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) throw new Error("Gagal memuat profil");
        const json = await res.json();
        const user = json.data as UserProfile;
        setProfile(user);
        setName(user.name || "");
        setBio(user.bio || "");
        setSpecialization(user.specialization || "");
      } catch {
        setMessage({ type: "error", text: "Gagal memuat data profil." });
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) fetchProfile();
  }, [session?.user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio: bio || null, specialization: specialization || null }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal memperbarui profil");
      }

      const json = await res.json();
      setProfile((prev) => (prev ? { ...prev, ...json.data } : prev));
      setMessage({ type: "success", text: "Profil berhasil diperbarui" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memperbarui profil.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-goto-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-txt-primary">Profil Saya</h1>
        <p className="text-sm text-txt-secondary">Kelola informasi profil Anda</p>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-[12px] border p-4 text-sm ${
            message.type === "success"
              ? "border-goto-green/30 bg-goto-green/10 text-goto-green"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-[12px] border border-border bg-surface p-6 shadow-card">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-goto-green text-3xl font-bold text-white">
              {profile?.name?.charAt(0) || <UserCircle size={40} />}
            </div>
            <h2 className="text-lg font-semibold text-txt-primary">{profile?.name}</h2>
            <p className="text-sm text-txt-secondary">{profile?.email}</p>
            <span className="mt-2 inline-block rounded-full bg-goto-green/10 px-3 py-1 text-xs font-medium text-goto-green">
              {roleLabelsMap[profile?.role || ""] || profile?.role}
            </span>
          </div>

          <div className="mt-6 space-y-3 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-txt-muted">Total Artikel</span>
              <span className="font-medium text-txt-primary">{profile?._count?.articles || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-txt-muted">Bergabung</span>
              <span className="font-medium text-txt-primary">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
            {profile?.specialization && (
              <div className="flex justify-between text-sm">
                <span className="text-txt-muted">Spesialisasi</span>
                <span className="font-medium text-txt-primary">{profile.specialization}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 rounded-[12px] border border-border bg-surface p-6 shadow-card">
          <h3 className="mb-4 text-lg font-semibold text-txt-primary">Edit Profil</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-secondary">Nama</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-secondary">Email</label>
              <input
                type="email"
                value={profile?.email || ""}
                className="input w-full cursor-not-allowed opacity-60"
                disabled
              />
              <p className="mt-1 text-xs text-txt-muted">
                Email tidak dapat diubah. Hubungi admin untuk perubahan.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-secondary">Peran</label>
              <input
                type="text"
                value={roleLabelsMap[profile?.role || ""] || profile?.role || ""}
                className="input w-full cursor-not-allowed opacity-60"
                disabled
              />
              <p className="mt-1 text-xs text-txt-muted">
                Peran hanya dapat diubah oleh admin.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-secondary">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input w-full resize-none"
                rows={4}
                maxLength={500}
                placeholder="Tulis bio singkat tentang Anda..."
              />
              <p className="mt-1 text-xs text-txt-muted">{bio.length}/500 karakter</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-txt-secondary">
                Spesialisasi
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="input w-full"
                maxLength={200}
                placeholder="Mis: Hukum Pidana, Hukum Tata Negara..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
