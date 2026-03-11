"use client";

import { sanitizeUrl } from "@/lib/utils";

interface Media {
  id: string;
  url: string;
  createdAt: string;
  album: { title: string };
  uploadedBy: { name: string | null };
}

interface TimelineProps {
  media: Media[];
}

export default function Timeline({ media }: TimelineProps) {
  // Group by month
  const groups = media.reduce((acc, m) => {
    const date = new Date(m.createdAt);
    const monthYear = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(m);
    return acc;
  }, {} as Record<string, Media[]>);

  const entries = Object.entries(groups).slice(0, 5); // Show last 5 months

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-3">
        <i className="fas fa-timeline"></i> Línea de Tiempo
      </h2>
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 h-full w-1 bg-amber-200 transform md:-translate-x-1/2"></div>

          {entries.map(([monthYear, items], index) => (
            <div key={monthYear} className="relative mb-12 last:mb-0">
              {/* Dot */}
              <div className="absolute left-4 md:left-1/2 w-6 h-6 bg-amber-600 rounded-full border-4 border-amber-100 transform -translate-x-1/2 z-10"></div>
              
              <div className={`flex flex-col md:flex-row items-start md:items-center ${index % 2 === 0 ? "" : "md:flex-row-reverse"}`}>
                {/* Content Card */}
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"}`}>
                  <div className="inline-block bg-amber-50 rounded-xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition">
                    <h3 className="font-extrabold text-amber-800 text-xl capitalize">{monthYear}</h3>
                    <p className="text-amber-700 font-medium mt-1">
                      {items.length} recuerdos compartidos
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-start md:justify-end">
                      {/* Show unique album tags */}
                      {Array.from(new Set(items.map(i => i.album.title))).slice(0, 3).map(tag => (
                        <span key={tag} className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Empty Space for the line in Mobile, Image Grid for Desktop */}
                <div className="w-full md:w-1/2 pl-12 md:pl-0 mt-4 md:mt-0">
                   <div className="grid grid-cols-3 gap-2">
                     {items.slice(0, 3).map(item => (
                       <div key={item.id} className="aspect-square rounded-lg overflow-hidden border-2 border-amber-100 shadow-sm transition hover:scale-105">
                         <img src={sanitizeUrl(item.url)} alt="Recuerdo" className="w-full h-full object-cover" />
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
