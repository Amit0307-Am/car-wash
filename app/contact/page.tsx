import { business } from "@/config/business";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Contact"
        title="Visit or reach out anytime"
        description="A clean, easy contact page for customers who want to call, message, or get directions quickly."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">Business</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{business.businessName}</h3>
            </div>

            <div className="space-y-3 text-slate-300">
              <p>{business.address}</p>
              <p>{business.location}</p>
              <p>{business.openingHours}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button href={`tel:${business.phone.replace(/\s+/g, "")}`}>Call Now</Button>
              <Button href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} variant="secondary">
                WhatsApp
              </Button>
              <Button href={business.mapsUrl} target="_blank" rel="noreferrer" variant="secondary">
                Get Directions
              </Button>
            </div>

            <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/50 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                Directions
              </p>
              <div className="mt-4 rounded-3xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-5">
                <div className="rounded-2xl border border-dashed border-white/20 p-5 text-slate-300">
                  <p className="text-lg font-semibold text-white">Find us easily</p>
                  <p className="mt-2 text-sm leading-6">
                    Use the map link below for the quickest route to the studio and arrival guidance.
                  </p>
                  <div className="mt-4">
                    <Button href={business.mapsUrl} target="_blank" rel="noreferrer" variant="secondary">
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">Quick info</p>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</p>
              <a href={`tel:${business.phone.replace(/\s+/g, "")}`} className="mt-1 block text-base text-white hover:text-amber-300">
                {business.phone}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">WhatsApp</p>
              <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} className="mt-1 block text-base text-white hover:text-amber-300">
                {business.whatsapp}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Google rating</p>
              <p className="mt-1 text-base text-white">{business.googleRating}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Location</p>
              <p className="mt-1 text-base text-white">{business.location}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
