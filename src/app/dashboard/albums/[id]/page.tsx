import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Uploader from "@/components/Uploader";
import DeleteAlbumButton from "@/components/DeleteAlbumButton";

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      createdBy: true,
      media: {
        include: { uploadedBy: true, comments: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!album || album.familyId !== session.user.familyId) {
    return notFound();
  }

  const isOwner = session.user.id === album.createdById;

  return (
    <div className="container" style={{ paddingBottom: "5rem" }}>
      {/* Header / Navigation */}
      <div style={{ marginBottom: "3rem" }}>
        <Link href="/dashboard" style={{ 
          color: "var(--primary)", textDecoration: "none", display: "inline-flex", 
          alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontWeight: 600,
          fontSize: "0.95rem"
        }}>
          &larr; Volver al Dashboard
        </Link>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem" }}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <h1 className="title-gradient" style={{ fontSize: "3.5rem", lineHeight: 1.1 }}>{album.title}</h1>
              {isOwner && (
                <span style={{ 
                  background: "var(--primary)", color: "white", padding: "0.3rem 0.8rem", 
                  borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 800,
                  boxShadow: "0 4px 12px rgba(99,102,241,0.4)"
                }}>
                  DUEÑO
                </span>
              )}
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "1.25rem", maxWidth: "800px", lineHeight: 1.5 }}>
              {album.description || "Un espacio para guardar momentos inolvidables."}
            </p>
            <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--primary)" }}>
                    {album.createdBy.name?.[0] || "?"}
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                  Cultivado por <strong>{album.createdBy.name}</strong> · {new Date(album.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-end" }}>
            {isOwner && <DeleteAlbumButton albumId={album.id} />}
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="glass-panel" style={{ padding: "2rem", marginBottom: "4rem", border: "1px dashed var(--primary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <h3 style={{ marginBottom: "0.25rem" }}>Agregar nuevos recuerdos</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Comparte fotos o videos con toda la familia en este álbum.</p>
          </div>
          <Uploader albumId={album.id} />
        </div>
      </div>

      {/* Content Gallery */}
      <h2 style={{ fontSize: "1.75rem", marginBottom: "2rem" }}>✨ {album.media.length} Recuerdos compartidos</h2>
      
      {album.media.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "6rem 2rem", marginTop: "2rem", borderRadius: "var(--radius-lg)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>📸</div>
          <h3 style={{ color: "var(--text-main)", marginBottom: "0.75rem", fontSize: "1.5rem" }}>Este álbum está esperando su historia</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Sé el primero en subir una foto o video para darle vida.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {album.media.map((m) => (
            <Link href={`/dashboard/media/${m.id}`} key={m.id} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="glass-panel media-card-premium" style={{ 
                    overflow: "hidden", cursor: "pointer", transition: "var(--transition)", position: "relative"
                }}>
                  <div style={{ height: "250px", backgroundColor: "#000", position: "relative" }}>
                    <img src={m.url} alt="Recuerdo familiar" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                    {m.type === "VIDEO" && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                            <span style={{ fontSize: "3rem" }}>▶️</span>
                        </div>
                    )}
                    <div style={{ 
                        position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", 
                        color: "white", padding: "0.4rem 0.75rem", borderRadius: "12px", fontSize: "0.85rem", backdropFilter: "blur(4px)"
                    }}>
                        💬 {m.comments.length}
                    </div>
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700 }}>
                                {m.uploadedBy.name?.[0] || "?"}
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Subido por <strong>{m.uploadedBy.name}</strong></p>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
