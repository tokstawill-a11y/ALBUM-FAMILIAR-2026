import AlbumForm from "@/components/AlbumForm";
import Link from "next/link";

export default function NewAlbumPage() {
  return (
    <div className="container" style={{ maxWidth: "600px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard" style={{ color: "var(--primary)", textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
          &larr; Volver a los álbumes
        </Link>
        <h1 style={{ fontSize: "2.5rem" }}>Nuevo Álbum</h1>
        <p style={{ color: "var(--text-muted)" }}>Agrupa los mejores recuerdos de tu familia.</p>
      </div>
      
      <div className="glass-panel" style={{ padding: "2rem", width: "100%" }}>
        <AlbumForm />
      </div>
    </div>
  )
}
