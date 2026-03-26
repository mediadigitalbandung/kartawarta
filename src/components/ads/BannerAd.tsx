interface BannerAdProps {
  size: "leaderboard" | "billboard" | "sidebar" | "inline";
  className?: string;
}

const sizeConfig = {
  leaderboard: {
    height: "120px",
    label: "Leaderboard Ad",
    containerClass: "py-3",
  },
  billboard: {
    height: "280px",
    label: "Billboard Ad",
    containerClass: "py-4",
  },
  sidebar: {
    height: "280px",
    label: "Sidebar Ad",
    containerClass: "py-3",
  },
  inline: {
    height: "150px",
    label: "Inline Ad",
    containerClass: "py-4",
  },
};

export default function BannerAd({ size, className = "" }: BannerAdProps) {
  const config = sizeConfig[size];

  return (
    <div className={`${config.containerClass} ${className}`}>
      <div className="container-main">
        <div
          className="relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-surface-tertiary via-surface-secondary to-surface-tertiary flex items-center justify-center"
          style={{ height: config.height }}
        >
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)",
          }} />
          <div className="relative text-center">
            <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">
              Iklan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SidebarAd() {
  return (
    <div className="rounded-lg bg-gradient-to-b from-surface-tertiary to-surface-secondary flex items-center justify-center overflow-hidden relative" style={{ height: "280px" }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)",
      }} />
      <div className="relative text-center">
        <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
      </div>
    </div>
  );
}
