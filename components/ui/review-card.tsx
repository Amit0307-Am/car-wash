import type { Review } from "@/config/business";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-3 shadow-lg shadow-slate-950/30 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{review.name}</p>
          <p className="text-xs text-slate-400">{review.service}</p>
        </div>
        <div className="flex items-center gap-1 text-amber-300" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={`${review.id}-star-${index}`}>{index < review.rating ? "★" : "☆"}</span>
          ))}
        </div>
      </div>

      <p className="mt-3 flex-1 text-sm leading-6 text-slate-300 sm:leading-6">“{review.review}”</p>
    </article>
  );
}
