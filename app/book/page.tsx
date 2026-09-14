import { BookingStepper } from "@/components/booking/booking-stepper";
import { SectionHeading } from "@/components/ui/section-heading";

export default function BookPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Booking"
        title="Book your car wash slot"
        description="Choose a service, pick your vehicle, select a time, and confirm your booking in a few quick steps."
      />

      <div className="mt-12">
        <BookingStepper />
      </div>
    </main>
  );
}
