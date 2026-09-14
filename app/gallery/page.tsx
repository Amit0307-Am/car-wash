import { galleryItems } from "@/config/business";
import { GalleryCard } from "@/components/ui/gallery-card";
import { SectionHeading } from "@/components/ui/section-heading";

export default function GalleryPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Gallery"
        title="Recent work and detailing highlights"
        description="A visual showcase for the kind of finish customers can expect from the studio."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {galleryItems.map((item) => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
