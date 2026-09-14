import Link from "next/link";
import { business, services } from "@/config/business";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-lg font-black text-slate-950">
              A
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                {business.businessName}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
            {business.shortDescription}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Services
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {services.slice(0, 5).map((service) => (
              <li key={service.id}>
                <Link href="/services" className="hover:text-white">
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>
              <a href={`tel:${business.phone.replace(/\s+/g, "")}`} className="hover:text-white">
                {business.phone}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} className="hover:text-white">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={business.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                Get Directions
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Visit us
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">{business.address}</p>
          <p className="mt-4 text-sm text-slate-300">{business.openingHours}</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-col gap-1">
            <p>© 2026 {business.businessName}. All rights reserved.</p>
            <p className="text-xs text-slate-500">Demo website for presentation purposes.</p>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
