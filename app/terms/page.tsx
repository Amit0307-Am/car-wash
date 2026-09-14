import { SectionHeading } from "@/components/ui/section-heading";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Terms"
        title="Booking terms and conditions"
        description="These general terms summarize the basic expectations for appointments, payments, and service availability."
      />

      <div className="mt-12 space-y-6 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 text-slate-300 sm:p-8">
        <p>
          Customers are expected to arrive at the scheduled time and inform the business in advance if they need to reschedule or cancel.
        </p>
        <p>
          Pricing and service offerings may be updated from time to time based on availability, vehicle condition, and package selection.
        </p>
        <p>
          Final service details, timing, and any add-on work will be confirmed at the time of booking or on arrival.
        </p>
      </div>
    </main>
  );
}
