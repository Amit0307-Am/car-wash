import { services } from "@/config/business";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceCard } from "@/components/ui/service-card";

export default function ServicesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Services"
        title="Premium care for every vehicle"
        description="Choose the service level that matches your routine, your schedule, and the finish you want for your car."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      <div className="mt-16 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">
              Need a custom care plan?
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Book the right service for your car.</h2>
          </div>
          <Button href="/book">Book Your Slot</Button>
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 sm:p-8">
        <h3 className="text-2xl font-bold text-white">Vehicle types supported</h3>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
          {"Hatchback, Sedan, SUV".split(",").map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {item.trim()}
            </span>
          ))}
        </div>
        <p className="mt-4 text-slate-300">
          Future pricing and service variations can be added later without changing the public frontend structure.
        </p>
      </div>
    </main>
  );
}
