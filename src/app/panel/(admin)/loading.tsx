export default function PanelLoading() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <span className="sr-only">Cargando…</span>
      <div className="h-12 w-64 animate-pulse rounded-xl bg-cream-deep motion-reduce:animate-none" />
      <div className="h-40 animate-pulse rounded-card bg-cream-deep motion-reduce:animate-none" />
    </div>
  );
}
