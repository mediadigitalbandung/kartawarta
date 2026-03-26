import SimulationBadge from "@/components/SimulationBadge";

interface BannerAdProps {
  size: "leaderboard" | "billboard" | "sidebar" | "inline";
  className?: string;
}

const sizeConfig = {
  leaderboard: {
    width: "100%",
    height: "90px",
    label: "Leaderboard Ad",
    containerClass: "py-3",
  },
  billboard: {
    width: "100%",
    height: "250px",
    label: "Billboard Ad",
    containerClass: "py-4",
  },
  sidebar: {
    width: "100%",
    height: "250px",
    label: "300 x 250",
    containerClass: "py-3",
  },
  inline: {
    width: "100%",
    height: "120px",
    label: "Inline Ad",
    containerClass: "py-4",
  },
};

export default function BannerAd({ size, className = "" }: BannerAdProps) {
  const config = sizeConfig[size];

  return (
    <div className={`${config.containerClass} ${className}`}>
      <div className="container-main">
        <div className="flex flex-col items-center">
          <div
            className="relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-surface-tertiary via-surface-secondary to-surface-tertiary flex items-center justify-center"
            style={{ maxWidth: config.width, height: config.height }}
          >
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)",
            }} />

            {/* Content */}
            <div className="relative text-center">
              <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">
                Iklan
              </p>
              <p className="mt-0.5 text-[10px] text-txt-muted/40">
                {config.label}
              </p>
            </div>
          </div>
          <div className="mt-1 flex items-center">
            <span className="text-[9px] text-txt-muted/40 uppercase tracking-wider">Advertisement</span>
            <SimulationBadge />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SidebarAd() {
  return (
    <div className="rounded-lg bg-gradient-to-b from-surface-tertiary to-surface-secondary flex items-center justify-center overflow-hidden relative" style={{ height: "250px" }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)",
      }} />
      <div className="relative text-center">
        <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
        <p className="mt-0.5 text-[10px] text-txt-muted/40">300 x 250</p>
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <span className="text-[9px] text-txt-muted/40 uppercase tracking-wider flex items-center gap-1">
          Advertisement <SimulationBadge />
        </span>
      </div>
    </div>
  );
}
