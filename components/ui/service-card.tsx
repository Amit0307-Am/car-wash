import Link from "next/link";
import type { Service } from "@/config/business";

type ServiceCardProps = {
  service: Service;
  variant?: "default" | "compact";
};

export function ServiceCard({ service, variant = "default" }: ServiceCardProps) {
  if (variant === "compact") {
    return (
      <article
        className={`group flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-lg shadow-slate-950/30 transition-transform duration-200 hover:-translate-y-1 sm:min-h-[240px] sm:rounded-3xl ${
          service.id === "full-car-detailing" ? "col-span-2" : ""
        }`}
      >
        <div className={`relative h-16 overflow-hidden bg-gradient-to-br sm:h-20 ${service.accent}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.38),_transparent_45%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.15),rgba(15,23,42,0.55))]" />
          <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-slate-950/30 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm sm:left-4 sm:top-4 sm:px-2 sm:text-[9px]">
            {service.name.split(" ")[0]}
          </div>
          <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-black text-white/90 shadow-lg shadow-slate-950/20 backdrop-blur-sm sm:right-4 sm:top-4 sm:h-9 sm:w-9 sm:text-sm">
            ✦
          </div>
          <div className="absolute inset-x-2 bottom-2 rounded-full border border-white/20 bg-slate-950/35 px-1.5 py-1 backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:px-2">
            <div className="flex items-center justify-between gap-2 text-[7px] font-medium uppercase tracking-[0.2em] text-slate-100 sm:text-[8px]">
              <span>{service.duration}</span>
              <span>Care</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3">
          <h3 className="text-sm font-semibold text-white sm:text-base">{service.name}</h3>
          <p className="mt-1 text-[11px] leading-4 text-slate-300 sm:text-xs sm:leading-5">
            {service.description}
          </p>

          <div className="mt-3 flex items-end justify-between gap-2 border-t border-white/10 pt-2.5">
            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-slate-400 sm:text-[9px]">From</p>
              <p className="mt-1 text-base font-bold text-white sm:text-lg">{service.startingPrice}</p>
            </div>
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-medium text-white transition-colors hover:border-amber-400/60 hover:bg-amber-500 hover:text-slate-950 sm:px-3 sm:py-2 sm:text-xs"
            >
              Book
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/30 transition-transform duration-200 hover:-translate-y-1">
      <div className={`relative h-24 overflow-hidden bg-gradient-to-br sm:h-32 ${service.accent}`}>
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

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white sm:text-xl">{service.name}</h3>
            <p className="mt-2 text-sm leading-5 text-slate-300 sm:leading-6">{service.description}</p>
          </div>
          <span className="hidden rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[10px] font-medium text-amber-200 sm:inline-flex">
            {service.duration}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3 sm:mt-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs">Starting from</p>
            <p className="mt-1 text-lg font-bold text-white sm:text-2xl">{service.startingPrice}</p>
          </div>
          <Link
            href="/book"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-amber-400/60 hover:bg-amber-500 hover:text-slate-950 sm:px-4 sm:py-2 sm:text-sm"
          >
            Book now
          </Link>
        </div>

        <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-300 sm:mt-4 sm:space-y-2 sm:text-sm">
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
