export default function SimulationBadge() {
  return (
    <span
      className="ml-2 inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700"
      title="Data simulasi — bukan data real"
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
      Simulasi
    </span>
  );
}
