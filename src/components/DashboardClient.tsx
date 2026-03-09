"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Uploader from "./Uploader";
import { importFromUrlAction } from "@/actions/media";

interface Media {
  id: string;
  url: string;
  type: string;
  albumId: string;
  createdAt: string;
  album: { id: string; title: string };
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
  { id: "all", label: "Todos", icon: "🏠" },
  { id: "albums", label: "Álbumes", icon: "📂" },
  { id: "photos", label: "Fotos", icon: "🖼️" },
  { id: "videos", label: "Videos", icon: "🎬" },
];

export default function DashboardClient({
  albums,
  recentMedia,
  familyMembers,
  totalPhotos,
  totalVideos,
  currentUserId,
  currentUserName,
  familyId,
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Modals & Popups
  const [showUploader, setShowUploader] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showGoogleDriveMsg, setShowGoogleDriveMsg] = useState(false);
  
  // Form states
  const [selectedAlbumForAction, setSelectedAlbumForAction] = useState(
    albums[0]?.id || ""
  );
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter settings
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [filterOwner, setFilterOwner] = useState<"all" | "mine">("all");

  const albumCarouselRef = useRef<HTMLDivElement>(null);

  const filteredMedia = useMemo(() => {
    let result = [...recentMedia];
    
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.album.title.toLowerCase().includes(q) || 
        (m.uploadedBy.name || "").toLowerCase().includes(q)
      );
    }

    // Category
    if (activeCategory === "photos") result = result.filter(m => m.type === "IMAGE");
    if (activeCategory === "videos") result = result.filter(m => m.type === "VIDEO");

    // Member
    if (selectedMember) result = result.filter(m => m.uploadedBy.id === selectedMember);

    // Filter Owner
    if (filterOwner === "mine") result = result.filter(m => m.uploadedBy.id === currentUserId);

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [recentMedia, activeCategory, selectedMember, searchQuery, sortBy, filterOwner, currentUserId]);

  const filteredAlbums = useMemo(() => {
    let result = [...albums];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        (a.description || "").toLowerCase().includes(q)
      );
    }

    // Filter Owner
    if (filterOwner === "mine") result = result.filter(a => a.createdById === currentUserId);

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [albums, searchQuery, sortBy, filterOwner, currentUserId]);

  const showAlbums = activeCategory === "all" || activeCategory === "albums";
  const showMediaList = activeCategory === "all" || activeCategory === "photos" || activeCategory === "videos";

  const featuredAlbum = albums.find((a) => a._count.media > 0) || albums[0];

  const timeline = useMemo(() => {
    const groups: Record<string, Media[]> = {};
    recentMedia.forEach((m) => {
      const date = new Date(m.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6);
  }, [recentMedia]);

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    if (!selectedAlbumForAction) {
       setActionError("Por favor selecciona un álbum primero.");
       return;
    }
    
    setIsImporting(true);
    setActionError(null);
    try {
      const res = await importFromUrlAction(selectedAlbumForAction, importUrl);
      if (res?.error) {
        setActionError(res.error);
      } else {
        setShowUrlModal(false);
        setImportUrl("");
      }
    } catch (err) {
      setActionError("Error al importar el archivo");
    } finally {
      setIsImporting(false);
    }
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (albumCarouselRef.current) {
      const itemWidth = albumCarouselRef.current.offsetWidth * 0.8;
      const scrollAmount = direction === "left" ? -itemWidth : itemWidth;
      albumCarouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div style={{ paddingBottom: "4rem", position: "relative" }}>
      {/* Action Popups / Modals (Sin cambios, ya son responsivos por glass-panel) */}
      
      {showUploader && (
        <div className="modal-overlay" onClick={() => setShowUploader(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
        }}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{
            padding: "2.5rem", width: "550px", maxWidth: "95vw"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
              <h2 className="title-gradient">Subir Recuerdo</h2>
              <button onClick={() => setShowUploader(false)} style={{ fontSize: "1.5rem" }}>✕</button>
            </div>
            {albums.length === 0 ? (
               <div style={{ textAlign: "center", padding: "2rem" }}>
                 <p style={{ marginBottom: "1.5rem" }}>Primero necesitas crear un álbum.</p>
                 <Link href="/dashboard/albums/new" className="btn-primary">Crear mi primer Álbum</Link>
               </div>
            ) : (
              <>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Seleccionar Álbum</label>
                  <select 
                    value={selectedAlbumForAction} 
                    onChange={e => setSelectedAlbumForAction(e.target.value)}
                    style={{ width: "100%", padding: "0.75rem" }}
                  >
                    {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>
                <Uploader albumId={selectedAlbumForAction} onSuccess={() => setShowUploader(false)} />
              </>
            )}
          </div>
        </div>
      )}

      {showUrlModal && (
        <div className="modal-overlay" onClick={() => setShowUrlModal(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
        }}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{
            padding: "2.5rem", width: "550px", maxWidth: "95vw"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
              <h2 className="title-gradient">Importar desde URL</h2>
              <button onClick={() => setShowUrlModal(false)} style={{ fontSize: "1.5rem" }}>✕</button>
            </div>
            <form onSubmit={handleUrlImport}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>URL de la imagen o video</label>
                <input 
                  type="url" 
                  placeholder="https://ejemplo.com/foto.jpg"
                  required
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem" }}
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Álbum destino</label>
                <select 
                  value={selectedAlbumForAction} 
                  onChange={e => setSelectedAlbumForAction(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem" }}
                >
                  <option value="">Selecciona un álbum...</option>
                  {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>
              {actionError && <p style={{ color: "var(--error)", marginBottom: "1rem" }}>{actionError}</p>}
              <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={isImporting}>
                {isImporting ? "Importando..." : "Importar ahora"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header Actions - Optimizado para móvil (Stacking) */}
      <div className="container" style={{ marginBottom: "2.5rem" }}>
        <div className="glass-panel main-header-grid" style={{
            padding: "2rem", display: "grid", gap: "2rem", alignItems: "center"
        }}>
          {/* Active Dropzone */}
          <div
            onClick={() => setShowUploader(true)}
            className="dropzone-premium"
            style={{
              border: "2px dashed var(--primary)", borderRadius: "var(--radius-md)", padding: "3.5rem 2rem",
              textAlign: "center", cursor: "pointer", background: "rgba(99, 102, 241, 0.05)",
              transition: "var(--transition)", position: "relative"
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>☁️</div>
            <h3 className="title-gradient" style={{ marginBottom: "0.5rem" }}>Guarda un nuevo recuerdo</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Arrastra archivos aquí o haz clic</p>
            <button className="btn-primary" style={{ marginTop: "1.5rem" }}>Seleccionar Archivos</button>
          </div>

          {/* Quick Action Capsules - Grid responsivo */}
          <div className="quick-actions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
            <button className="glass-panel action-card" onClick={() => setShowUploader(true)} style={{ padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📸</div>
              <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Tomar foto</p>
            </button>
            <button className="glass-panel action-card" onClick={() => setShowUrlModal(true)} style={{ padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔗</div>
              <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Importar URL</p>
            </button>
            <button className="glass-panel action-card" onClick={() => setShowGoogleDriveMsg(true)} style={{ padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🌩️</div>
              <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Google Drive</p>
            </button>
            <Link href="/dashboard/albums/new" className="glass-panel action-card" style={{ padding: "1.5rem", textAlign: "center", textDecoration: "none", color: "inherit" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📂</div>
              <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Nuevo Álbum</p>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .main-header-grid {
          grid-template-columns: 1.2fr 1fr;
        }
        @media (max-width: 900px) {
          .main-header-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .quick-actions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Stats Section - Ya es auto-fit y funciona bien en móvil */}
      <div className="container" style={{ marginBottom: "3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.25rem" }}>
          {[
            { label: "Álbumes", val: albums.length, icon: "📂", color: "var(--primary)" },
            { label: "Fotos", val: totalPhotos, icon: "🖼️", color: "var(--secondary)" },
            { label: "Videos", val: totalVideos, icon: "🎬", color: "#10b981" },
            { label: "Miembros", val: familyMembers.length, icon: "👨‍👩‍👧‍👦", color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} className="glass-panel" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ fontSize: "2rem", opacity: 0.8 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar - Optimizado para móvil */}
      <div className="container" style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          {/* Categories - Scrollable en móvil */}
          <div style={{ 
            display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.05)", padding: "0.4rem", 
            borderRadius: "var(--radius-full)", overflowX: "auto", maxWidth: "100%", scrollbarWidth: "none"
          }}>
            {CATEGORIES.map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveCategory(c.id)}
                style={{ 
                  padding: "0.5rem 1.25rem", borderRadius: "var(--radius-full)", border: "none", cursor: "pointer",
                  background: activeCategory === c.id ? "var(--primary)" : "transparent",
                  color: activeCategory === c.id ? "white" : "var(--text-muted)",
                  fontWeight: 600, transition: "var(--transition)", fontSize: "0.85rem", whiteSpace: "nowrap"
                }}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div style={{ display: "flex", gap: "0.75rem", flex: 1, minWidth: "280px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
              <input 
                type="text" 
                placeholder="Busca..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "10px", fontSize: "0.9rem" }}
              />
            </div>

            <button 
              className={showFilterMenu ? "btn-primary" : "btn-secondary"}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              style={{ height: "100%", padding: "0 1rem", borderRadius: "10px" }}
            >
              🎚️
            </button>
          </div>
        </div>
      </div>

      {/* Albums Carousel Section */}
      {showAlbums && filteredAlbums.length > 0 && (
        <div className="container" style={{ marginBottom: "4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.75rem" }}>📂 Álbumes</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => scrollCarousel("left")} className="btn-secondary" style={{ padding: "0.4rem", borderRadius: "50%" }}>←</button>
              <button onClick={() => scrollCarousel("right")} className="btn-secondary" style={{ padding: "0.4rem", borderRadius: "50%" }}>→</button>
            </div>
          </div>
          
          <div 
            ref={albumCarouselRef}
            className="carousel-container"
          >
            {filteredAlbums.map(a => (
              <div key={a.id} className="carousel-item">
                <Link href={`/dashboard/albums/${a.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="glass-panel album-card-premium" style={{ 
                    overflow: "hidden", position: "relative", transition: "var(--transition)", height: "100%",
                    border: a.createdById === currentUserId ? "1px solid var(--primary)" : "1px solid var(--border)"
                  }}>
                    <div style={{ 
                      height: "180px", background: a.media[0] ? `url(${a.media[0].url}) center/cover` : "var(--primary-light)",
                      display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
                    }}>
                      {!a.media[0] && <span style={{ fontSize: "3rem", opacity: 0.2 }}>📁</span>}
                      {a.createdById === currentUserId && (
                        <div style={{ 
                          position: "absolute", top: "10px", left: "10px", background: "var(--primary)", color: "white",
                          padding: "0.3rem 0.7rem", borderRadius: "10px", fontSize: "0.7rem", fontWeight: 800
                        }}>
                          MÍO
                        </div>
                      )}
                      <div style={{ 
                        position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.6)", 
                        color: "white", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem"
                      }}>
                        {a._count.media} 📸
                      </div>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <h3 style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>{a.title}</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>Por {a.createdBy.name}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            
            {/* Tarjeta para Crear Nuevo Álbum al final del carrusel */}
            <div className="carousel-item">
              <Link href="/dashboard/albums/new" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="glass-panel" style={{ 
                  height: "100%", minHeight: "260px", display: "flex", flexDirection: "column", 
                  alignItems: "center", justifyContent: "center", border: "2px dashed var(--border)", 
                  color: "var(--text-muted)", textAlign: "center", padding: "1rem"
                }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📂</div>
                  <p style={{ fontWeight: 700 }}>+ Crear Álbum</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Reciente y Family Section (Ya responsivos pero asegurando paddings) */}
      
      {/* Media Feed */}
      {showMediaList && filteredMedia.length > 0 && (
        <div className="container" style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>✨ Recuerdos Recientes</h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(200px, 1fr))" : "1fr",
            gap: "1.25rem" 
          }}>
            {filteredMedia.map(m => (
              <Link href={`/dashboard/media/${m.id}`} key={m.id} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="glass-panel media-card-premium" style={{ 
                   padding: "0.5rem", display: viewMode === "list" ? "flex" : "block", gap: "1rem", alignItems: "center"
                }}>
                  <div style={{ 
                    height: viewMode === "grid" ? "180px" : "80px", width: viewMode === "list" ? "120px" : "100%",
                    background: `url(${m.url}) center/cover`, borderRadius: "var(--radius-md)", position: "relative"
                  }}>
                    {m.type === "VIDEO" && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)" }}>
                      <span style={{ fontSize: "2rem" }}>▶️</span>
                    </div>
                    )}
                  </div>
                  <div style={{ flex: 1, padding: viewMode === "grid" ? "0.75rem 0.25rem" : 0 }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.15rem" }}>{m.album.title}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{m.uploadedBy.name} · {m._count.comments} 💬</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Family Section - Scrollable en móvil */}
      <div className="container" style={{ marginBottom: "4rem" }}>
        <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>👨‍👩‍👧‍👦 La Familia</h2>
        <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", scrollbarWidth: "none" }}>
          {familyMembers.map(member => (
            <button 
              key={member.id} 
              onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
              className="glass-panel member-capsule"
              style={{
                flex: "0 0 160px", padding: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
                border: selectedMember === member.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                background: selectedMember === member.id ? "rgba(99, 102, 241, 0.1)" : "var(--surface)",
                transition: "var(--transition)"
              }}
            >
              <div style={{ 
                width: "60px", height: "60px", borderRadius: "50%", background: member.image ? `url(${member.image}) center/cover` : "var(--primary-light)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: "white"
              }}>
                {!member.image && (member.name?.[0] || "?")}
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{member.name}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{member._count.uploadedMedia} aportes</p>
              </div>
            </button>
          ))}
          
          <button 
            onClick={() => {
              const shareUrl = `${window.location.origin}/register`;
              const text = `¡Hola! Únete a nuestro Álbum Familiar para compartir fotos y recuerdos. Regístrate aquí: ${shareUrl}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            style={{ flex: "0 0 160px", background: "none", border: "none", padding: 0 }}
          >
            <div className="glass-panel" style={{ height: "100%", padding: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", border: "2px dashed var(--border)", color: "var(--text-muted)" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", border: "2px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>+</div>
              <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Invitar por WhatsApp</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
