import Image from "next/image";

import { business, reviews, services } from "@/config/business";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/ui/review-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceCard } from "@/components/ui/service-card";

const trustPoints = [
  "Professional Car Care",
  "Quality Products",
  "Experienced Staff",
  "Quick Service",
];

const howItWorks = [
  { title: "Choose Service", description: "Pick the care plan that matches your car." },
  { title: "Select Date & Time", description: "Choose a convenient slot from available openings." },
  { title: "Confirm Booking", description: "Review your details and confirm in seconds." },
  { title: "Bring Your Car", description: "Visit the studio and enjoy a fresh finish." },
];

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/10 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.28),_transparent_35%),linear-gradient(120deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.9))]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
          <div className="grid items-center gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
            <div className="order-1 max-w-xl">
              <p className="mb-3 inline-flex rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200 sm:text-xs">
                Open today • {business.location}
              </p>
              <h1 className="text-3xl font-black leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Give Your Car The Shine It Deserves
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-300 sm:mt-5 sm:text-lg sm:leading-8">
                {business.heroTagline}
              </p>
              <div className="mt-5 flex flex-col gap-2.5 sm:mt-7 sm:flex-row">
                <Button href="/book" className="w-full sm:w-auto">Book Your Slot</Button>
                <Button
                  href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  WhatsApp Us
                </Button>
              </div>
            </div>

            <div className="order-2 rounded-[1.75rem] border border-white/10 bg-slate-900/60 p-2 shadow-2xl shadow-slate-950/50 sm:p-3">
              <div className="relative h-[280px] overflow-hidden rounded-[1.35rem] bg-slate-900 sm:h-[360px] lg:h-[420px]">
                <Image
                  src="/hero-car-wash.jpg"
                  alt="Car wash professionals cleaning a red car in a detailing studio"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  loading="eager"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-slate-950/20" />
              </div>
            </div>

            <div className="order-3 lg:col-span-full">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Opening hours</p>
                  <p className="mt-1 text-sm font-medium text-white">{business.openingHours}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Location</p>
                  <p className="mt-1 text-sm font-medium text-white">{business.location}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Google rating</p>
                  <p className="mt-1 text-sm font-medium text-white">{business.googleRating}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {trustPoints.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-center shadow-lg shadow-slate-950/30 sm:p-5"
            >
              <p className="text-base font-semibold text-white">{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Popular services"
            title="Premium care, tailored to your routine"
            description="Choose the treatment that fits your schedule, your budget, and the condition of your vehicle."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Book in a few easy steps"
          description="Fast enough for mobile users, clear enough for new customers, and easy to extend later."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {howItWorks.map((item, index) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-slate-950">
                {index + 1}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Customer feedback"
            title="What customers appreciate most"
            description="Demo testimonials for presentation use only."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">
                Ready to book?
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">Book your next wash in under a minute.</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/book">Book Your Slot</Button>
              <Button href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} variant="secondary">
                WhatsApp Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
