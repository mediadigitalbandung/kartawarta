"use client";

import { slotLabels, slotSpecs } from "./ad-constants";

const AD_SLOT = "bg-goto-green/15 border-2 border-dashed border-goto-green text-goto-green font-bold flex items-center justify-center";

function AdSlot({ active, label, className }: { active: boolean; label: string; className?: string }) {
  if (!active) return null;
  return (
    <div className={`${AD_SLOT} rounded text-[8px] sm:text-[9px] ${className || ""}`}>
      <span className="px-1 text-center leading-tight">{label}</span>
    </div>
  );
}

export default function SlotWireframe({ slot }: { slot: string }) {
  const spec = slotSpecs[slot];

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-card">
      <h3 className="text-sm font-bold text-txt-primary mb-1">Posisi di Halaman</h3>
      <p className="text-xs text-txt-muted mb-3">Area hijau = lokasi iklan di website</p>

      {/* ── Mini JHB Website ── */}
      <div className="relative rounded-xl border border-border overflow-hidden shadow-sm" style={{ fontSize: 0 }}>

        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 bg-[#e8e8e8] px-2.5 py-1.5">
          <div className="flex gap-1">
            <span className="h-[6px] w-[6px] rounded-full bg-[#ff5f57]" />
            <span className="h-[6px] w-[6px] rounded-full bg-[#febc2e]" />
            <span className="h-[6px] w-[6px] rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 h-[14px] rounded-full bg-white ml-2 flex items-center px-2">
            <span className="text-[7px] text-[#999] font-medium">jurnalishukumbandung.com</span>
          </div>
        </div>

        {/* ── Dark header ── */}
        <div className="bg-[#1C1C1E] px-3 py-2 flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-goto-green flex items-center justify-center">
            <span className="text-[5px] font-bold text-white">JHB</span>
          </div>
          <div>
            <span className="text-[8px] font-bold text-white leading-none block">Jurnalis Hukum</span>
            <span className="text-[6px] text-white/40">Bandung</span>
          </div>
          <div className="flex-1" />
          <div className="h-3 w-14 rounded-full bg-white/10 flex items-center px-1.5">
            <span className="text-[5px] text-white/40">Cari...</span>
          </div>
          <div className="h-4 w-4 rounded-full bg-goto-green flex items-center justify-center">
            <span className="text-[5px] text-white font-bold">U</span>
          </div>
        </div>

        {/* ── Category nav ── */}
        <div className="bg-white border-b border-[#E5E7EB] px-3 py-1 flex gap-2 overflow-hidden">
          {["Terkini", "H. Pidana", "H. Perdata", "Tata Negara", "HAM"].map((c, i) => (
            <span key={c} className={`text-[7px] font-medium whitespace-nowrap ${i === 0 ? "text-goto-green border-b border-goto-green" : "text-[#6B7280]"}`}>{c}</span>
          ))}
        </div>

        {/* ── Trending ticker ── */}
        <div className="bg-white border-b border-[#E5E7EB] px-3 py-0.5 flex items-center gap-1">
          <span className="text-[5px] font-bold text-goto-green tracking-wider">TRENDING</span>
          <div className="flex-1 flex items-center gap-2 overflow-hidden">
            {["Reformasi Intelijen", "Unhan", "Hukum Perdata"].map(t => (
              <span key={t} className="flex items-center gap-0.5 text-[5px] text-[#6B7280] whitespace-nowrap">
                <span className="h-[3px] w-[3px] rounded-full bg-goto-green/50" />{t}
              </span>
            ))}
          </div>
        </div>

        {/* ── HEADER AD SLOT ── */}
        <AdSlot active={slot === "HEADER"} label={`IKLAN — ${spec?.ratio}`} className="h-6 mx-2 mt-1.5" />

        {/* ── Hero / Headline Slider ── */}
        <div className="mx-2 mt-1.5 rounded-md overflow-hidden relative" style={{ height: 56 }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1E] to-[#2d2d30] rounded-md" />
          <div className="relative p-2 flex flex-col justify-end h-full">
            <div className="h-1 w-4 rounded-full bg-goto-green mb-1" />
            <div className="h-[5px] w-3/4 rounded bg-white/60 mb-0.5" />
            <div className="h-[4px] w-1/2 rounded bg-white/30" />
          </div>
        </div>

        {/* ── BETWEEN SECTIONS AD ── */}
        <AdSlot active={slot === "BETWEEN_SECTIONS"} label={`IKLAN — ${spec?.ratio}`} className="h-6 mx-2 mt-1.5" />

        {/* ── Content + Sidebar ── */}
        <div className="flex gap-1.5 px-2 mt-1.5">
          {/* Main content — Berita Terkini */}
          <div className="flex-1 min-w-0">
            {/* Section header */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[7px] font-bold text-[#1C1C1E]">Berita Terkini</span>
              <span className="text-[5px] text-goto-green font-medium">Lihat Semua</span>
            </div>
            {/* Article cards */}
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-1.5 mb-1 rounded-md bg-white border border-[#E5E7EB] p-1 overflow-hidden">
                <div className="shrink-0 w-8 h-6 rounded bg-gradient-to-br from-[#ddd] to-[#eee]" />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="h-[4px] w-full rounded bg-[#1C1C1E]/20" />
                  <div className="h-[3px] w-3/4 rounded bg-[#1C1C1E]/10" />
                  <div className="flex gap-1">
                    <span className="h-[3px] w-6 rounded-full bg-goto-green/30" />
                    <span className="h-[3px] w-8 rounded bg-[#9CA3AF]/30" />
                  </div>
                </div>
              </div>
            ))}

            {/* ── IN-ARTICLE AD ── */}
            <AdSlot active={slot === "IN_ARTICLE"} label={`IKLAN — ${spec?.ratio}`} className="h-5 my-1" />

            {/* More articles */}
            {[4, 5].map(i => (
              <div key={i} className="flex gap-1.5 mb-1 rounded-md bg-white border border-[#E5E7EB] p-1 overflow-hidden">
                <div className="shrink-0 w-8 h-6 rounded bg-gradient-to-br from-[#ddd] to-[#eee]" />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="h-[4px] w-full rounded bg-[#1C1C1E]/20" />
                  <div className="h-[3px] w-2/3 rounded bg-[#1C1C1E]/10" />
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="shrink-0 w-[65px] space-y-1.5">
            {/* SIDEBAR AD */}
            {slot === "SIDEBAR" ? (
              <div className={`${AD_SLOT} rounded-md min-h-[52px] text-[8px] p-1 text-center leading-tight`}>
                IKLAN<br />{spec?.ratio}
              </div>
            ) : (
              <>
                {/* Trending sidebar */}
                <div className="rounded-md bg-white border border-[#E5E7EB] p-1">
                  <span className="text-[6px] font-bold text-[#1C1C1E] block mb-0.5">Trending</span>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-0.5 mb-0.5">
                      <span className="text-[6px] font-bold text-goto-green">{i}</span>
                      <div className="h-[3px] flex-1 rounded bg-[#1C1C1E]/10" />
                    </div>
                  ))}
                </div>
                {/* Polling */}
                <div className="rounded-md bg-white border border-[#E5E7EB] p-1">
                  <span className="text-[6px] font-bold text-[#1C1C1E] block mb-0.5">Polling</span>
                  <div className="space-y-0.5">
                    <div className="h-2 rounded bg-goto-green/20" />
                    <div className="h-2 rounded bg-blue-500/20 w-3/4" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── FOOTER AD ── */}
        <AdSlot active={slot === "FOOTER"} label={`IKLAN — ${spec?.ratio}`} className="h-5 mx-2 mt-1.5" />

        {/* ── Dark Footer ── */}
        <div className="bg-[#1C1C1E] mt-1.5 px-3 py-2">
          <div className="flex gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="h-3 w-3 rounded-full bg-goto-green flex items-center justify-center">
                  <span className="text-[4px] text-white font-bold">JHB</span>
                </div>
                <span className="text-[6px] font-bold text-white">Jurnalis Hukum Bandung</span>
              </div>
              <div className="h-[3px] w-20 rounded bg-white/10" />
              <div className="h-[3px] w-16 rounded bg-white/10" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[5px] font-bold text-white/40 uppercase">Tentang</span>
              {[1, 2, 3].map(i => <div key={i} className="h-[3px] w-10 rounded bg-white/10" />)}
            </div>
            <div className="space-y-0.5">
              <span className="text-[5px] font-bold text-white/40 uppercase">Kontak</span>
              {[1, 2, 3].map(i => <div key={i} className="h-[3px] w-10 rounded bg-white/10" />)}
            </div>
          </div>
          <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-between">
            <span className="text-[4px] text-white/20">2026 Jurnalis Hukum Bandung</span>
            <span className="text-[4px] text-white/20">Dewan Pers Indonesia</span>
          </div>
        </div>

        {/* ── FLOATING BOTTOM overlay ── */}
        {slot === "FLOATING_BOTTOM" && (
          <div className="absolute bottom-8 left-2 right-2 z-10">
            <div className={`${AD_SLOT} rounded-lg h-6 text-[8px] shadow-lg bg-white/90 backdrop-blur-sm`}>
              IKLAN FLOATING — {spec?.ratio}
            </div>
          </div>
        )}

        {/* ── POPUP overlay ── */}
        {slot === "POPUP" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <div className={`${AD_SLOT} rounded-xl px-4 py-6 text-[9px] shadow-2xl bg-white/95 backdrop-blur-sm`}>
              POP-UP IKLAN<br />{spec?.ratio}
            </div>
          </div>
        )}
      </div>

      {/* Spec summary */}
      <div className="mt-4 rounded-xl bg-goto-light/50 p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-txt-primary">{slotLabels[slot]}</span>
          <span className="rounded-full bg-goto-green px-2.5 py-0.5 text-[10px] font-bold text-white">{spec?.ratio}</span>
        </div>
        <p className="text-xs text-txt-secondary">{spec?.desc}</p>
        <div className="flex gap-3 text-[10px] text-txt-muted">
          <span>Lebar: {spec?.width}px</span>
          <span>Tinggi: {spec?.height}px</span>
          <span>Format: JPG, PNG, GIF</span>
        </div>
      </div>
    </div>
  );
}
