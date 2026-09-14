import { reviews } from "@/config/business";
import { ReviewCard } from "@/components/ui/review-card";
import { SectionHeading } from "@/components/ui/section-heading";

export default function ReviewsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Reviews"
        title="What customers are saying"
        description="These review cards highlight the kinds of feedback the business can showcase once real testimonials are collected."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </main>
  );
}
