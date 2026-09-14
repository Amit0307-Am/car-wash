"use client";

import Link from "next/link";
import { useState } from "react";
import { business } from "@/config/business";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-lg font-black text-slate-950">
            A
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
              {business.businessName}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Premium detailing
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate-300 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button href={`tel:${business.phone.replace(/\s+/g, "")}`} variant="secondary">
            Call
          </Button>
          <Button href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} variant="secondary">
            WhatsApp
          </Button>
          <Button href="/book">Book Your Slot</Button>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white md:hidden"
          onClick={() => setMenuOpen((state) => !state)}
        >
          <span className="sr-only">Open menu</span>
          <div className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
          </div>
        </button>
      </nav>

      {menuOpen ? (
        <div className="border-t border-white/10 bg-slate-950 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl px-3 py-3 text-base font-medium text-slate-200 hover:bg-white/5"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Button href="/book" className="w-full">
                Book Slot
              </Button>
              <Button href={`tel:${business.phone.replace(/\s+/g, "")}`} variant="secondary" className="w-full">
                Call
              </Button>
              <Button href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} variant="secondary" className="col-span-2 w-full">
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
