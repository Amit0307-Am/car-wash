import Link from "next/link";
import type { Service } from "@/config/business";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/30 transition-transform duration-200 hover:-translate-y-1">
      <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${service.accent}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.38),_transparent_45%)]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{service.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{service.description}</p>
          </div>
          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-200">
            {service.duration}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Starting from</p>
            <p className="mt-1 text-2xl font-bold text-white">{service.startingPrice}</p>
          </div>
          <Link
            href="/book"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-amber-400/60 hover:bg-amber-500 hover:text-slate-950"
          >
            Book now
          </Link>
        </div>

        <ul className="mt-5 space-y-2 text-sm text-slate-300">
          {service.includes.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
