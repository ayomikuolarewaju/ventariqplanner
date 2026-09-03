"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Slide = { src: string; alt: string };

/**
 * HeroSlideshow — Ventariq
 *
 * Crossfades between event hero images every 5s. Sits absolutely
 * positioned behind the hero's text content, with the existing dark
 * gradient overlay layered on top for legibility. Falls back to
 * rendering nothing (just the plain navy background) if no images are
 * available -- e.g. before any event has a hero_image set.
 */

export default function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden min-h-[100%] md:min-h-[460px] p-5">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image 
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover object-center h-full w-full"
          />
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              onClick={() => setIndex(i)}
              aria-label={`Show ${slide.alt}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-[#B8863B]" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
