"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-base font-black text-slate-950 sm:h-10 sm:w-10 sm:text-lg">
            A
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 sm:text-sm">
              {business.businessName}
            </p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 sm:text-[10px]">
              Premium detailing
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
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

        <div className="hidden items-center gap-3 lg:flex">
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
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-amber-400/60 hover:bg-white/10 lg:hidden"
          onClick={() => setMenuOpen((state) => !state)}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
          </div>
        </button>
      </nav>

      {menuOpen ? (
        <div id="mobile-menu" className="border-t border-white/10 bg-slate-950 lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-2">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">Menu</p>
              <button
                type="button"
                aria-label="Close navigation menu"
                className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-200 hover:border-amber-400/60 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-2 border-t border-white/10 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <Button href="/book" className="col-span-2 w-full">
                  Book Slot
                </Button>
                <Button href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} variant="secondary" className="w-full">
                  WhatsApp
                </Button>
                <Button href={`tel:${business.phone.replace(/\s+/g, "")}`} variant="secondary" className="w-full">
                  Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
