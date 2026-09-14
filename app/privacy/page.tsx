import { SectionHeading } from "@/components/ui/section-heading";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Privacy Policy"
        title="How we handle your information"
        description="This policy outlines the basics of what the business collects, why it is needed, and how it is used."
      />

      <div className="mt-12 space-y-6 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 text-slate-300 sm:p-8">
        <p>
          We collect only the information required to complete a booking and provide service updates, such as your name, mobile number, vehicle details, and service preferences.
        </p>
        <p>
          This information is used to confirm appointments, manage the booking schedule, communicate important updates, and support customer service requests.
        </p>
        <p>
          Contact the business directly if you need more information about how your personal information is handled or want to request corrections.
        </p>
      </div>
    </main>
  );
}
