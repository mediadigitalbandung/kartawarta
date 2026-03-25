"use client";

import { useSession } from "next-auth/react";
import {
  FileText,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const stats = [
  { label: "Total Artikel", value: "156", icon: FileText, color: "text-blue-500 bg-blue-50" },
  { label: "Total Views", value: "24.5K", icon: Eye, color: "text-green-500 bg-green-50" },
  { label: "Menunggu Review", value: "8", icon: Clock, color: "text-yellow-500 bg-yellow-50" },
  { label: "Dipublikasikan", value: "142", icon: CheckCircle, color: "text-emerald-500 bg-emerald-50" },
  { label: "Laporan Masuk", value: "3", icon: AlertTriangle, color: "text-red-500 bg-red-50" },
  { label: "Views Hari Ini", value: "1.2K", icon: TrendingUp, color: "text-purple-500 bg-purple-50" },
];

const recentArticles = [
  { title: "MK Putuskan Uji Materi UU Cipta Kerja", status: "PUBLISHED", date: "25 Mar 2026", views: 1250 },
  { title: "Kasus Penipuan Online Meningkat 40%", status: "PUBLISHED", date: "25 Mar 2026", views: 890 },
  { title: "Sengketa Lahan Bandung Utara", status: "IN_REVIEW", date: "24 Mar 2026", views: 0 },
  { title: "LBH Soroti Pelanggaran HAM Buruh", status: "PUBLISHED", date: "24 Mar 2026", views: 432 },
  { title: "Dampak Revisi KUHP (Draft)", status: "DRAFT", date: "23 Mar 2026", views: 0 },
];

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  IN_REVIEW: "bg-yellow-100 text-yellow-700",
  DRAFT: "bg-gray-100 text-gray-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  PUBLISHED: "Dipublikasikan",
  IN_REVIEW: "Dalam Review",
  DRAFT: "Draft",
  REJECTED: "Ditolak",
};

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Selamat datang kembali, {session?.user?.name}!
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className={`inline-flex rounded-lg p-2 ${stat.color}`}>
                <Icon size={18} />
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent articles */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Artikel Terbaru
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentArticles.map((article, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {article.title}
                  </p>
                  <p className="text-xs text-gray-500">{article.date}</p>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  {article.views > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye size={12} /> {article.views}
                    </span>
                  )}
                  <span className={`badge ${statusColors[article.status]}`}>
                    {statusLabels[article.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Aksi Cepat
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            <a
              href="/panel/artikel/baru"
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-gray-700"
            >
              <FileText size={24} className="text-primary-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tulis Artikel Baru
              </span>
            </a>
            <a
              href="/panel/artikel"
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-gray-700"
            >
              <Clock size={24} className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Review Artikel
              </span>
            </a>
            <a
              href="/panel/statistik"
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-gray-700"
            >
              <TrendingUp size={24} className="text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Lihat Statistik
              </span>
            </a>
            <a
              href="/panel/laporan"
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-gray-700"
            >
              <AlertTriangle size={24} className="text-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cek Laporan
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Editorial checklist reminder */}
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
        <h3 className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-300">
          <CheckCircle size={18} />
          Pengingat Standar Jurnalistik
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
          <li>&#10003; Pastikan setiap artikel memiliki minimal 1 sumber terverifikasi</li>
          <li>&#10003; Judul tidak clickbait atau sensasional berlebihan</li>
          <li>&#10003; Cover both sides — berikan perspektif berimbang</li>
          <li>&#10003; Tidak mengandung unsur SARA</li>
          <li>&#10003; Gunakan bahasa sesuai PUEBI</li>
        </ul>
      </div>
    </div>
  );
}
