import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import CommentForm from "@/components/CommentForm";
import DeleteMediaButton from "@/components/DeleteMediaButton";
import { sanitizeUrl } from "@/lib/utils";

export default async function MediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      uploadedBy: true,
      album: {
          include: { createdBy: true }
      },
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!media || media.album.familyId !== session.user.familyId) {
    return notFound();
  }

  const isUploader = media.uploadedById === session.user.id;
  const isAlbumOwner = media.album.createdById === session.user.id;
  const canDelete = isUploader || isAlbumOwner;

  return (
    <div className="container" style={{ maxWidth: "1200px", paddingBottom: "5rem" }}>
      {/* Navigation */}
      <div style={{ marginBottom: "2rem" }}>
        <Link href={`/dashboard/albums/${media.albumId}`} style={{ 
          color: "var(--primary)", textDecoration: "none", display: "inline-flex", 
          alignItems: "center", gap: "0.5rem", fontWeight: 600, fontSize: "0.9rem"
        }}>
          &larr; Volver al Álbum
        </Link>
      </div>

      <div className="media-viewer-layout">
        {/* Main Content / Viewer */}
        <div style={{ width: "100%" }}>
          <div className="glass-panel" style={{ padding: "1rem", borderRadius: "16px", position: "relative" }}>
            <div style={{ 
              backgroundColor: "#111", borderRadius: "12px", width: "100%", 
              display: "flex", justifyContent: "center", alignItems: "center", 
              minHeight: "300px", overflow: "hidden", boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)"
            }}>
              {media.type === "IMAGE" ? (
                <img src={sanitizeUrl(media.url)} alt="Recuerdo familiar" style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain" }} />
              ) : (
                <video src={sanitizeUrl(media.url)} controls style={{ maxWidth: "100%", maxHeight: "75vh" }} />
              )}
            </div>
            
            <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--primary)" }}>
                    {media.uploadedBy.name?.[0] || "?"}
                </div>
                <div>
                    <p style={{ color: "var(--text-main)", fontWeight: 700, fontSize: "0.95rem" }}>{media.uploadedBy.name}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{new Date(media.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <a href={sanitizeUrl(media.url)} download className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  ⬇
                </a>
                {canDelete && <DeleteMediaButton mediaId={media.id} albumId={media.albumId} />}
              </div>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="glass-panel" style={{ 
          padding: "1.5rem", display: "flex", flexDirection: "column", 
          minHeight: "400px", maxHeight: "85vh"
        }}>
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem", color: "var(--text-main)" }}>
            💬 Comentarios ({media.comments.length})
          </h3>
          
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {media.comments.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>No hay comentarios aún.</p>
            ) : (
              media.comments.map(c => (
                <div key={c.id} style={{ 
                  background: "rgba(255,255,255,0.03)", padding: "1rem", 
                  borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--primary)" }}>{c.author.name}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: "var(--text-main)", fontSize: "0.9rem" }}>{c.text}</p>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
            <CommentForm mediaId={media.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
