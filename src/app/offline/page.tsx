"use client";

export default function OfflinePage() {
  return (
    <div className="container-main py-20 text-center">
      <h1 className="text-3xl font-bold text-txt-primary mb-4">Anda Sedang Offline</h1>
      <p className="text-txt-secondary mb-6">
        Tidak ada koneksi internet. Silakan periksa koneksi Anda dan coba lagi.
      </p>
      <button onClick={() => window.location.reload()} className="btn-primary">
        Coba Lagi
      </button>
    </div>
  );
}
