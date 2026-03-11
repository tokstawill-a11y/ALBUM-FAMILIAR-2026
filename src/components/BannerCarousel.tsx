"use client";

import { useState, useEffect } from "react";

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: string;
  albumTitle: string;
}

interface BannerCarouselProps {
  items: CarouselItem[];
}

export default function BannerCarousel({ items }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[currentIndex];

  return (
    <section className="mb-12 bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-amber-800 flex items-center gap-3">
          <i className="fas fa-crown text-amber-500"></i> Momentos Destacados
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
            className="w-10 h-10 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full flex items-center justify-center transition"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
            className="w-10 h-10 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full flex items-center justify-center transition"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl group">
        <img 
          src={current.image} 
          alt={current.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12 text-white">
          <span className="bg-amber-500 text-amber-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider w-fit mb-3">
            {current.albumTitle}
          </span>
          <h3 className="text-3xl md:text-5xl font-black mb-3 drop-shadow-lg leading-tight">
            {current.title}
          </h3>
          <p className="text-sm md:text-xl text-amber-50/90 max-w-2xl font-medium">
            {current.description}
          </p>
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center mt-6 gap-3">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-3 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-8 bg-amber-600" : "w-3 bg-amber-200"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
