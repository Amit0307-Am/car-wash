import Link from "next/link";
import type { Service } from "@/config/business";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/30 transition-transform duration-200 hover:-translate-y-1">
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br sm:h-44 ${service.accent}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.38),_transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.15),rgba(15,23,42,0.55))]" />
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/30 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur-sm sm:left-5 sm:top-5 sm:px-2.5 sm:text-[10px]">
          {service.name.split(" ")[0]}
        </div>
        <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base font-black text-white/90 shadow-lg shadow-slate-950/20 backdrop-blur-sm sm:right-5 sm:top-5 sm:h-14 sm:w-14 sm:text-lg">
          ✦
        </div>
        <div className="absolute inset-x-3 bottom-3 rounded-full border border-white/20 bg-slate-950/35 px-2.5 py-1.5 backdrop-blur-sm sm:inset-x-4 sm:bottom-4 sm:px-3 sm:py-2">
          <div className="flex items-center justify-between gap-3 text-[9px] font-medium uppercase tracking-[0.2em] text-slate-100 sm:text-[10px]">
            <span>{service.duration}</span>
            <span>Car care</span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 to-transparent sm:h-20" />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white sm:text-xl">{service.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{service.description}</p>
          </div>
          <span className="hidden rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[10px] font-medium text-amber-200 sm:inline-flex">
            {service.duration}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:mt-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs">Starting from</p>
            <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{service.startingPrice}</p>
          </div>
          <Link
            href="/book"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-amber-400/60 hover:bg-amber-500 hover:text-slate-950"
          >
            Book now
          </Link>
        </div>

        <ul className="mt-4 space-y-1.5 text-sm text-slate-300 sm:mt-5 sm:space-y-2">
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
