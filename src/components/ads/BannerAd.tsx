interface BannerAdProps {
  size: "leaderboard" | "billboard" | "sidebar" | "inline" | "slim";
  className?: string;
}

const sizeConfig = {
  slim: {
    ratio: "4 / 1",       // same as leaderboard
    containerClass: "py-2",
  },
  leaderboard: {
    ratio: "4 / 1",       // standard banner
    containerClass: "py-3",
  },
  billboard: {
    ratio: "3 / 1",       // wider billboard
    containerClass: "py-4",
  },
  sidebar: {
    ratio: "4 / 3",       // vertical sidebar
    containerClass: "py-3",
  },
  inline: {
    ratio: "6 / 1",       // thin inline
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
          style={{ aspectRatio: config.ratio }}
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
    <div
      className="rounded-lg bg-gradient-to-b from-surface-tertiary to-surface-secondary flex items-center justify-center overflow-hidden relative w-full"
      style={{ aspectRatio: "4 / 3" }}
    >
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)",
      }} />
      <div className="relative text-center">
        <p className="text-xs font-semibold text-txt-muted/60 uppercase tracking-wider">Iklan</p>
      </div>
    </div>
  );
}
