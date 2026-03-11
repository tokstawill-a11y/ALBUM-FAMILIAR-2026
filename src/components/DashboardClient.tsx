"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Uploader from "./Uploader";
import FamilyMembers from "./FamilyMembers";
import Timeline from "./Timeline";
import BannerCarousel from "./BannerCarousel";
import { importFromUrlAction } from "@/actions/media";
import { sanitizeUrl } from "@/lib/utils";

interface Media {
  id: string;
  url: string;
  type: string;
  albumId: string;
  createdAt: string;
  album: { id: string; title: string; description: string | null };
  uploadedBy: { id: string; name: string | null; image: string | null };
  _count: { comments: number };
}

interface Album {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  createdById: string; 
  createdBy: { name: string | null };
  _count: { media: number };
  media: Media[];
}

interface FamilyMember {
  id: string;
  name: string | null;
  image: string | null;
  _count: { uploadedMedia: number };
}

const CATEGORIES = [
  { id: "all", label: "Todas", icon: "fa-star" },
  { id: "albums", label: "Álbumes", icon: "fa-layer-group" },
  { id: "photos", label: "Fotos", icon: "fa-image" },
  { id: "videos", label: "Videos", icon: "fa-film" },
];

export default function DashboardClient({
  albums,
  recentMedia,
  familyMembers,
  currentUserId,
  currentUserName,
}: {
  albums: Album[];
  recentMedia: Media[];
  familyMembers: FamilyMember[];
  totalPhotos: number;
  totalVideos: number;
  currentUserId: string;
  currentUserName: string;
  familyId: string;
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedAlbumForAction, setSelectedAlbumForAction] = useState(albums[0]?.id || "");
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredMedia = useMemo(() => {
    let result = [...recentMedia];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.album.title.toLowerCase().includes(q) || 
        (m.uploadedBy.name || "").toLowerCase().includes(q)
      );
    }

    if (activeCategory === "photos") result = result.filter(m => m.type === "IMAGE");
    if (activeCategory === "videos") result = result.filter(m => m.type === "VIDEO");
    if (selectedMember) result = result.filter(m => m.uploadedBy.id === selectedMember);

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [recentMedia, activeCategory, selectedMember, searchQuery]);

  const carouselItems = useMemo(() => {
    return albums.filter(a => a.media.length > 0).slice(0, 3).map(a => ({
      id: a.id,
      title: a.title,
      description: a.description || "Un hermoso recuerdo compartido por todos.",
      image: sanitizeUrl(a.media[0].url),
      albumTitle: "Favorito de la Familia"
    }));
  }, [albums]);

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl || !selectedAlbumForAction) return;
    setIsImporting(true);
    setActionError(null);
    try {
      const res = await importFromUrlAction(selectedAlbumForAction, importUrl);
      if (res?.error) setActionError(res.error);
      else {
        setShowUrlModal(false);
        setImportUrl("");
      }
    } catch (err) {
      setActionError("Error al importar el archivo");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-amber-50 min-h-screen">
      {/* App Header */}
      <header className="bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-3 hover:scale-105 transition">
            <i className="fas fa-camera-retro text-3xl"></i>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "white" }}>Álbum Familiar</h1>
          </Link>
          <div className="flex items-center space-x-6">
             <div className="relative group cursor-pointer hidden md:block">
               <i className="fas fa-bell text-xl"></i>
               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">2</span>
             </div>
             <div className="flex items-center space-x-3 bg-amber-700/50 px-4 py-2 rounded-full border border-white/20">
                <span className="font-bold text-sm">{currentUserName}</span>
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-black">
                   {currentUserName?.[0]?.toUpperCase()}
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        
        {/* Section 1: Categories & Search */}
        <section className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex overflow-x-auto pb-2 gap-3 w-full md:w-auto scrollbar-hide">
              {CATEGORIES.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setActiveCategory(c.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap shadow-sm border-2 ${
                    activeCategory === c.id ? "bg-amber-600 text-white border-amber-600" : "bg-white text-amber-800 border-amber-100 hover:bg-amber-100"
                  }`}
                >
                  <i className={`fas ${c.icon}`}></i>
                  {c.label}
                </button>
              ))}
           </div>
           
           <div className="relative w-full md:w-[400px]">
             <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-amber-400"></i>
             <input 
               type="text" 
               placeholder="Buscar recuerdos..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-12 pr-4 py-3 border-2 border-amber-100 rounded-full focus:ring-4 focus:ring-amber-200 outline-none font-bold"
             />
           </div>
        </section>

        {/* Section 2: Uploader Grid */}
        <Uploader albumId={selectedAlbumForAction} />

        {/* Section 3: High-Visibility Filter for Seniors */}
        <section className="mb-10 flex flex-wrap gap-4 items-center bg-amber-100/50 p-6 rounded-2xl border-2 border-amber-100">
           <div className="flex items-center gap-3">
             <i className="fas fa-filter text-amber-600 text-xl font-bold"></i>
             <span className="font-extrabold text-amber-800">Ver recuerdos:</span>
           </div>
           <div className="flex flex-wrap gap-3">
             <button className="bg-white px-5 py-2 rounded-xl font-black text-xs text-amber-800 border-2 border-amber-200 shadow-sm">ORDENAR POR FECHA ↓</button>
             <button className="bg-white px-5 py-2 rounded-xl font-black text-xs text-amber-800 border-2 border-amber-200 shadow-sm">MIS FOTOS</button>
             {albums.length > 0 && (
               <select 
                 value={selectedAlbumForAction} 
                 onChange={e => setSelectedAlbumForAction(e.target.value)}
                 className="bg-white px-5 py-2 rounded-xl font-black text-xs text-amber-800 border-2 border-amber-200 shadow-sm outline-none"
               >
                 {albums.map(a => <option key={a.id} value={a.id}>ÁLBUM: {a.title.toUpperCase()}</option>)}
               </select>
             )}
             <button 
                onClick={() => setShowUrlModal(true)}
                className="bg-amber-600 px-5 py-2 rounded-xl font-black text-xs text-white shadow-md hover:bg-amber-700 transition"
             >
                + IMPORTAR URL
             </button>
           </div>
        </section>

        {/* Section 4: Recent Photos Grid */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-amber-800 flex items-center gap-4">
               <span className="w-12 h-1 bg-amber-600 rounded-full"></span>
               Fotos Recientes
            </h2>
            <Link href="/dashboard/albums/new" className="hidden md:flex items-center gap-2 font-black text-amber-600 hover:text-amber-800 transition">
               <i className="fas fa-plus-circle"></i> Nuevo Álbum
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredMedia.slice(0, 10).map((media) => (
              <Link 
                href={`/dashboard/media/${media.id}`} 
                key={media.id}
                className="photo-card group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl p-2"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <img src={sanitizeUrl(media.url)} alt="Recuerdo" className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-lg text-[10px] font-black text-amber-800 shadow-sm">
                     {media.album.title.toUpperCase()}
                  </div>
                </div>
                <div className="px-1 pb-2">
                   <p className="text-sm font-black text-amber-900 truncate">{media.album.title}</p>
                   <p className="text-[11px] font-bold text-amber-700/60 truncate flex items-center gap-1">
                      <i className="fas fa-user-circle"></i> {media.uploadedBy.name}
                   </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
             <button className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-black py-4 px-10 rounded-full border-2 border-amber-200 shadow-sm transition-all transform hover:-translate-y-1">
                VER TODAS LAS FOTOS
             </button>
          </div>
        </section>

        {/* Section 5: Highlight Carousel */}
        <BannerCarousel items={carouselItems} />

        {/* Section 6: Family Members */}
        <FamilyMembers 
           members={familyMembers} 
           selectedMemberId={selectedMember} 
           onSelectMember={setSelectedMember} 
        />

        {/* Section 7: Timeline View */}
        <Timeline media={recentMedia} />

      </main>

      {/* Footer Branding */}
      <footer className="bg-amber-950 text-white py-16">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <i className="fas fa-camera-retro text-4xl text-amber-500"></i>
                <h2 className="text-3xl font-black text-white">Álbum<br/>Familiar</h2>
              </div>
              <p className="text-amber-200 font-medium leading-relaxed">
                Organiza, comparte y preserva los momentos más valiosos de los tuyos. El lugar donde viven las memorias.
              </p>
            </div>
            
            <div>
              <h4 className="font-black text-white text-lg mb-6 border-b-2 border-amber-800 pb-2">ENLACES</h4>
              <ul className="space-y-3 font-bold text-amber-200/80">
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                <li><Link href="/dashboard/albums/new" className="hover:text-white transition">Crear Álbum</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-white text-lg mb-6 border-b-2 border-amber-800 pb-2">AYUDA</h4>
              <p className="text-amber-200/60 text-sm mb-4">¿Tienes problemas con la cámara o subiendo fotos?</p>
              <a href="mailto:ayuda@albumfamiliar.com" className="bg-amber-800 hover:bg-amber-700 text-white px-4 py-3 rounded-xl font-bold inline-block transition">
                 📧 Contactar Soporte
              </a>
            </div>

            <div>
              <h4 className="font-black text-white text-lg mb-6 border-b-2 border-amber-800 pb-2">APP MÓVIL</h4>
              <p className="text-amber-200/60 text-sm mb-4">Lleva el álbum contigo siempre en tu celular.</p>
              <div className="flex gap-2">
                 <button className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold border border-white/10">App Store</button>
                 <button className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold border border-white/10">Play Store</button>
              </div>
            </div>
        </div>
        <div className="container mt-16 pt-8 border-t border-amber-900 text-center text-amber-500/50 text-sm font-bold">
           © 2026 Álbum Familiar Interactivo · Hecho con ❤️ para la familia
        </div>
      </footer>

      {/* URL Import Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-amber-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border-4 border-amber-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-amber-800">Importar Recuerdo</h2>
              <button onClick={() => setShowUrlModal(false)} className="text-2xl text-amber-400 hover:text-amber-600 transition">✕</button>
            </div>
            <form onSubmit={handleUrlImport}>
               <div className="mb-6">
                 <label className="block text-amber-900 font-bold mb-2">Pega el link de la foto</label>
                 <input 
                   type="url" required 
                   placeholder="https://google.com/foto.jpg"
                   value={importUrl} onChange={e => setImportUrl(e.target.value)}
                   className="w-full px-4 py-3 border-2 border-amber-100 rounded-xl outline-none focus:border-amber-500 transition font-bold"
                 />
               </div>
               {actionError && <p className="text-red-600 font-bold mb-4">⚠️ {actionError}</p>}
               <button type="submit" disabled={isImporting} className="btn-primary w-full py-4 text-lg">
                 {isImporting ? "Importando..." : "GUARDAR EN MI ÁLBUM"}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
