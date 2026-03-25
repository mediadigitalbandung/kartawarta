"use client";

import { AlertTriangle, CheckCircle, Clock, Eye, XCircle } from "lucide-react";

const reasonLabels: Record<string, { label: string; color: string }> = {
  HOAX: { label: "Hoax", color: "bg-red-100 text-red-700" },
  INACCURATE: { label: "Tidak Akurat", color: "bg-yellow-100 text-yellow-700" },
  SARA: { label: "SARA", color: "bg-orange-100 text-orange-700" },
  DEFAMATION: { label: "Pencemaran Nama Baik", color: "bg-purple-100 text-purple-700" },
  OTHER: { label: "Lainnya", color: "bg-gray-100 text-gray-700" },
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PENDING: { label: "Menunggu", icon: Clock, color: "text-yellow-600" },
  REVIEWED: { label: "Sedang Ditinjau", icon: Eye, color: "text-blue-600" },
  RESOLVED: { label: "Selesai", icon: CheckCircle, color: "text-green-600" },
  DISMISSED: { label: "Ditolak", icon: XCircle, color: "text-gray-500" },
};

const demoReports = [
  { id: "1", articleTitle: "Kasus Penipuan Online Meningkat 40%", reason: "INACCURATE", detail: "Data yang digunakan tidak sesuai dengan data resmi Polrestabes Bandung.", email: "pembaca@email.com", status: "PENDING", date: "25 Mar 2026" },
  { id: "2", articleTitle: "LBH Soroti Pelanggaran HAM Buruh", reason: "HOAX", detail: "Informasi mengenai jumlah korban tidak benar.", email: null, status: "REVIEWED", date: "24 Mar 2026" },
  { id: "3", articleTitle: "Sidang Korupsi Proyek Infrastruktur", reason: "DEFAMATION", detail: "Artikel ini menyebutkan nama tersangka sebelum putusan pengadilan.", email: "advokat@lawfirm.co.id", status: "PENDING", date: "23 Mar 2026" },
  { id: "4", articleTitle: "Analisis Dampak Revisi KUHP", reason: "OTHER", detail: "Analisis tidak berimbang, hanya dari satu perspektif.", email: null, status: "RESOLVED", date: "22 Mar 2026" },
  { id: "5", articleTitle: "Sengketa Lahan Bandung Utara", reason: "SARA", detail: "Terdapat kalimat yang berpotensi menyinggung suku tertentu.", email: "warga@email.com", status: "DISMISSED", date: "20 Mar 2026" },
];

export default function LaporanPage() {
  const pendingCount = demoReports.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Laporan Berita
        </h1>
        <p className="text-sm text-gray-500">
          {pendingCount} laporan menunggu ditinjau
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = demoReports.filter((r) => r.status === key).length;
          return (
            <div key={key} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className={`flex items-center gap-2 text-sm ${config.color}`}>
                <Icon size={16} /> {config.label}
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {demoReports.map((report) => {
          const reason = reasonLabels[report.reason];
          const status = statusConfig[report.status];
          const StatusIcon = status.icon;
          return (
            <div
              key={report.id}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`badge ${reason.color}`}>
                      <AlertTriangle size={10} className="mr-1" />
                      {reason.label}
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${status.color}`}>
                      <StatusIcon size={12} />
                      {status.label}
                    </span>
                    <span className="text-xs text-gray-400">{report.date}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {report.articleTitle}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {report.detail}
                  </p>
                  {report.email && (
                    <p className="mt-1 text-xs text-gray-400">
                      Pelapor: {report.email}
                    </p>
                  )}
                </div>
                {report.status === "PENDING" && (
                  <div className="ml-4 flex gap-2">
                    <button className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100">
                      Tinjau
                    </button>
                    <button className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
