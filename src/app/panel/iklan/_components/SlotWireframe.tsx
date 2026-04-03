"use client";

import { slotLabels, slotSpecs } from "./ad-constants";

const ACTIVE = "bg-goto-green/15 border-2 border-dashed border-goto-green text-goto-green font-bold text-[10px] flex items-center justify-center";
const INACTIVE = "bg-surface-tertiary";

export default function SlotWireframe({ slot }: { slot: string }) {
  const spec = slotSpecs[slot];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <h3 className="text-sm font-bold text-txt-primary mb-1">Posisi di Halaman</h3>
      <p className="text-xs text-txt-muted mb-4">Area hijau menunjukkan lokasi iklan</p>

      {/* Wireframe */}
      <div className="relative rounded-xl border-2 border-border bg-surface-secondary p-3 space-y-1.5" style={{ minHeight: 280 }}>
        {/* Browser bar */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-red-300" />
            <span className="h-2 w-2 rounded-full bg-yellow-300" />
            <span className="h-2 w-2 rounded-full bg-green-300" />
          </div>
          <div className="flex-1 h-3 rounded-full bg-surface-tertiary ml-2" />
        </div>

        {/* Header bar */}
        <div className="flex items-center gap-2 mb-1">
          <div className="h-4 w-4 rounded bg-surface-tertiary" />
          <div className="h-2.5 w-20 rounded bg-surface-tertiary" />
          <div className="flex-1" />
          <div className="h-2 w-8 rounded bg-surface-tertiary" />
          <div className="h-2 w-8 rounded bg-surface-tertiary" />
        </div>

        {/* HEADER ad slot */}
        <div className={`rounded h-6 ${slot === "HEADER" ? ACTIVE : INACTIVE}`}>
          {slot === "HEADER" && <span>IKLAN — {spec.ratio}</span>}
        </div>

        {/* Category nav */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-2 w-10 rounded bg-surface-tertiary" />)}
        </div>

        {/* Body: content + sidebar */}
        <div className="flex gap-2 mt-1">
          {/* Main content */}
          <div className="flex-1 space-y-1.5">
            {/* Hero */}
            <div className="rounded h-14 bg-surface-tertiary" />

            {/* Between sections */}
            <div className={`rounded h-6 ${slot === "BETWEEN_SECTIONS" ? ACTIVE : INACTIVE}`}>
              {slot === "BETWEEN_SECTIONS" && <span>IKLAN — {spec.ratio}</span>}
            </div>

            {/* Article content block */}
            <div className="rounded bg-white border border-border p-1.5 space-y-1">
              <div className="h-2.5 w-3/4 rounded bg-surface-tertiary" />
              <div className="h-1.5 w-full rounded bg-surface-tertiary" />
              <div className="h-1.5 w-full rounded bg-surface-tertiary" />
              <div className="h-1.5 w-2/3 rounded bg-surface-tertiary" />
            </div>

            {/* In-article ad */}
            <div className={`rounded h-5 ${slot === "IN_ARTICLE" ? ACTIVE : INACTIVE}`}>
              {slot === "IN_ARTICLE" && <span>IKLAN — {spec.ratio}</span>}
            </div>

            {/* More content */}
            <div className="rounded bg-white border border-border p-1.5 space-y-1">
              <div className="h-1.5 w-full rounded bg-surface-tertiary" />
              <div className="h-1.5 w-full rounded bg-surface-tertiary" />
              <div className="h-1.5 w-1/2 rounded bg-surface-tertiary" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="shrink-0 w-[72px] space-y-1.5">
            <div className={`rounded min-h-[60px] ${slot === "SIDEBAR" ? ACTIVE + " p-1 text-center leading-tight" : INACTIVE}`}>
              {slot === "SIDEBAR" && <span>IKLAN<br />{spec.ratio}</span>}
            </div>
            <div className="rounded h-8 bg-surface-tertiary" />
            <div className="rounded h-6 bg-surface-tertiary" />
          </div>
        </div>

        {/* Footer ad */}
        <div className={`rounded h-6 mt-1 ${slot === "FOOTER" ? ACTIVE : INACTIVE}`}>
          {slot === "FOOTER" && <span>IKLAN — {spec.ratio}</span>}
        </div>

        {/* Footer */}
        <div className="rounded h-4 bg-surface-tertiary mt-0.5" />

        {/* Floating bottom overlay */}
        {slot === "FLOATING_BOTTOM" && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className={`rounded-lg h-7 ${ACTIVE} shadow-lg`}>
              IKLAN FLOATING — {spec.ratio}
            </div>
          </div>
        )}

        {/* Popup overlay */}
        {slot === "POPUP" && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl z-10">
            <div className={`rounded-xl px-6 py-8 ${ACTIVE} shadow-xl bg-white/90`}>
              POP-UP IKLAN<br />{spec.ratio}
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
