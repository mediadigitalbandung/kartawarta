"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function KontakPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="container-main py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hubungi Kami</h1>
        <div className="mt-2 h-1 w-16 bg-accent" />

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Contact info */}
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <MapPin size={20} className="text-primary-500" />
              <h3 className="mt-2 font-bold text-gray-900 dark:text-white">Alamat</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Bandung, Jawa Barat<br />Indonesia
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <Mail size={20} className="text-primary-500" />
              <h3 className="mt-2 font-bold text-gray-900 dark:text-white">Email</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                redaksi@jurnalishukumbandung.com
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <Phone size={20} className="text-primary-500" />
              <h3 className="mt-2 font-bold text-gray-900 dark:text-white">Telepon</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Hubungi via email
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-2">
            {sent ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-900 dark:bg-green-950">
                <div>
                  <Send size={40} className="mx-auto text-green-500" />
                  <h3 className="mt-4 text-lg font-bold text-green-800 dark:text-green-300">
                    Pesan Terkirim!
                  </h3>
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    Terima kasih telah menghubungi kami. Tim redaksi akan merespons dalam 1-2 hari kerja.
                  </p>
                  <button
                    onClick={() => { setSent(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-4 text-sm text-primary-500 hover:underline"
                  >
                    Kirim pesan lagi
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Kirim Pesan</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nama</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Subjek</label>
                    <select required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800">
                      <option value="">Pilih subjek</option>
                      <option value="umum">Pertanyaan Umum</option>
                      <option value="redaksi">Kirim Tulisan / Opini</option>
                      <option value="iklan">Pasang Iklan</option>
                      <option value="koreksi">Koreksi Berita</option>
                      <option value="kerjasama">Kerjasama</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Pesan</label>
                    <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                  <button type="submit" className="flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600">
                    <Send size={16} /> Kirim Pesan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
