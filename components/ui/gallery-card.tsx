import type { GalleryItem } from "@/config/business";

export function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/30">
      <div className={`relative h-72 overflow-hidden bg-gradient-to-br ${item.accent}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_40%)]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>
      <div className="px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">{item.category}</p>
        <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
      </div>
    </article>
  );
}
