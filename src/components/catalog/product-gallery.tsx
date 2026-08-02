"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  url: string;
}

/**
 * Desktop keeps the original vertical scroll-stack (works well with
 * unlimited page height). Mobile switches to a horizontal scroll-snap
 * carousel with swipe gestures (native touch scrolling, no JS gesture
 * library needed) and dot indicators, since a tall vertical stack forces a
 * lot of scrolling before reaching the size/add-to-cart controls on a phone.
 */
export function ProductGallery({ images, alt }: { images: GalleryImage[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }

  return (
    <div className="animate-fade-up">
      {/* Desktop: vertical stack */}
      <div className="hidden flex-col gap-3 md:flex">
        {images.map((image, index) => (
          <div key={image.id} className="relative aspect-[4/5] w-full overflow-hidden bg-cream-deep">
            <Image
              src={image.url}
              alt={alt}
              fill
              unoptimized
              priority={index === 0}
              className="object-cover"
              sizes="50vw"
            />
          </div>
        ))}
      </div>

      {/* Mobile: swipeable snap carousel */}
      <div className="md:hidden">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {images.map((image, index) => (
            <div key={image.id} className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-cream-deep">
              <Image
                src={image.url}
                alt={alt}
                fill
                unoptimized
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((image, index) => (
              <span
                key={image.id}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-5 bg-ink" : "w-1.5 bg-ink/25"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
