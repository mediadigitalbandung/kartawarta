"use client";

import { useState } from "react";
import {
  Plus,
  Eye,
  MousePointer,
  BarChart3,
  Edit,
  Trash2,
  Power,
  Calendar,
} from "lucide-react";

const slotLabels: Record<string, string> = {
  HEADER: "Header (728x90)",
  SIDEBAR: "Sidebar (300x250)",
  IN_ARTICLE: "In-Article",
  FOOTER: "Footer",
  POPUP: "Popup",
  FLOATING_BOTTOM: "Floating Bottom",
};

const demoAds = [
  { id: "1", name: "Banner Utama - Sponsor A", slot: "HEADER", type: "IMAGE", isActive: true, startDate: "1 Mar 2026", endDate: "31 Mar 2026", impressions: 45200, clicks: 1234, ctr: "2.73%" },
  { id: "2", name: "Sidebar - Iklan Hukum Online", slot: "SIDEBAR", type: "IMAGE", isActive: true, startDate: "15 Mar 2026", endDate: "15 Apr 2026", impressions: 32100, clicks: 567, ctr: "1.77%" },
  { id: "3", name: "In-Article - Jasa Pengacara", slot: "IN_ARTICLE", type: "HTML", isActive: true, startDate: "1 Mar 2026", endDate: "30 Apr 2026", impressions: 28400, clicks: 890, ctr: "3.13%" },
  { id: "4", name: "Footer - Event Hukum", slot: "FOOTER", type: "IMAGE", isActive: false, startDate: "1 Feb 2026", endDate: "28 Feb 2026", impressions: 15600, clicks: 234, ctr: "1.50%" },
  { id: "5", name: "Popup - Webinar Hukum", slot: "POPUP", type: "HTML", isActive: false, startDate: "10 Mar 2026", endDate: "20 Mar 2026", impressions: 8900, clicks: 445, ctr: "5.00%" },
];

export default function IklanPage() {
  const [showModal, setShowModal] = useState(false);

  const totalImpressions = demoAds.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = demoAds.reduce((sum, ad) => sum + ad.clicks, 0);
  const avgCtr = ((totalClicks / totalImpressions) * 100).toFixed(2);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Iklan</h1>
          <p className="text-sm text-gray-500">Atur banner iklan di berbagai posisi</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          <Plus size={16} />
          Tambah Iklan
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye size={16} className="text-blue-500" /> Total Impressions
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {totalImpressions.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MousePointer size={16} className="text-green-500" /> Total Clicks
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {totalClicks.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 size={16} className="text-purple-500" /> Avg. CTR
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{avgCtr}%</p>
        </div>
      </div>

      {/* Ads table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Nama Iklan</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Posisi</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Periode</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Impressions</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Clicks</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">CTR</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {demoAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{ad.name}</p>
                    <p className="text-xs text-gray-400">{ad.type}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {slotLabels[ad.slot]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar size={10} />
                      {ad.startDate} — {ad.endDate}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                    {ad.impressions.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                    {ad.clicks.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{ad.ctr}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ad.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      <Power size={10} />
                      {ad.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-yellow-500" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
