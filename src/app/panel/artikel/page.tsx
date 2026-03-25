"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";

const articles = [
  { id: "1", title: "MK Putuskan Uji Materi UU Cipta Kerja", category: "Hukum Tata Negara", status: "PUBLISHED", author: "Ahmad Fauzi", date: "25 Mar 2026", views: 1250, verification: "VERIFIED" },
  { id: "2", title: "Kasus Penipuan Online Meningkat 40%", category: "Hukum Pidana", status: "PUBLISHED", author: "Siti Nurhaliza", date: "25 Mar 2026", views: 890, verification: "VERIFIED" },
  { id: "3", title: "Sengketa Lahan Bandung Utara Masuk Persidangan", category: "Hukum Perdata", status: "IN_REVIEW", author: "Rizky Ramadhan", date: "24 Mar 2026", views: 0, verification: "UNVERIFIED" },
  { id: "4", title: "LBH Bandung Soroti Pelanggaran HAM Buruh", category: "HAM", status: "PUBLISHED", author: "Dewi Kartika", date: "24 Mar 2026", views: 432, verification: "VERIFIED" },
  { id: "5", title: "Dampak Revisi KUHP Terhadap Penegakan Hukum", category: "Opini", status: "DRAFT", author: "Prof. Dr. Hendra", date: "23 Mar 2026", views: 0, verification: "OPINION" },
  { id: "6", title: "PN Bandung Tangani 200 Kasus Baru", category: "Berita Bandung", status: "APPROVED", author: "Budi Santoso", date: "23 Mar 2026", views: 0, verification: "UNVERIFIED" },
  { id: "7", title: "Sidang Korupsi Proyek Infrastruktur", category: "Hukum Pidana", status: "REJECTED", author: "Andi Saputra", date: "22 Mar 2026", views: 0, verification: "UNVERIFIED" },
];

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PUBLISHED: { label: "Dipublikasikan", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  IN_REVIEW: { label: "Dalam Review", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
  DRAFT: { label: "Draft", icon: FileText, color: "text-gray-600 bg-gray-100" },
  APPROVED: { label: "Disetujui", icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
  REJECTED: { label: "Ditolak", icon: XCircle, color: "text-red-600 bg-red-50" },
};

export default function ArtikelPage() {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = articles.filter((a) => {
    const matchStatus = filterStatus === "ALL" || a.status === filterStatus;
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Artikel</h1>
          <p className="text-sm text-gray-500">Kelola semua artikel Anda</p>
        </div>
        <Link
          href="/panel/artikel/baru"
          className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          <Plus size={16} />
          Tulis Artikel
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          {["ALL", "DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === status
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {status === "ALL" ? "Semua" : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Judul</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Kategori</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Penulis</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Views</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Tanggal</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((article) => {
                const config = statusConfig[article.status];
                const StatusIcon = config.icon;
                return (
                  <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="max-w-[300px] px-5 py-3">
                      <p className="truncate font-medium text-gray-900 dark:text-white">
                        {article.title}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{article.category}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{article.author}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                        <StatusIcon size={12} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      {article.views > 0 ? article.views.toLocaleString("id-ID") : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{article.date}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-500 dark:hover:bg-gray-800" title="Lihat">
                          <Eye size={16} />
                        </button>
                        <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-yellow-500 dark:hover:bg-gray-800" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800" title="Hapus">
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

        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            Tidak ada artikel ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
