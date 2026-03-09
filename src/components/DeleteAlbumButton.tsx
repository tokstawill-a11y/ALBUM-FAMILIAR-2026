"use client";

import { useState } from "react";
import { deleteAlbumAction } from "@/actions/album";

export default function DeleteAlbumButton({ albumId }: { albumId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Estás seguro de que quieres eliminar este álbum y todos sus recuerdos? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsDeleting(true);
    const res = await deleteAlbumAction(albumId);
    if (res?.error) {
      alert(res.error);
      setIsDeleting(false);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        background: "rgba(239, 68, 68, 0.1)",
        color: "#ef4444",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        padding: "0.6rem 1.25rem",
        borderRadius: "var(--radius-md)",
        fontWeight: 600,
        cursor: isDeleting ? "not-allowed" : "pointer",
        transition: "var(--transition)"
      }}
      onMouseOver={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
      onMouseOut={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
    >
      {isDeleting ? "Eliminando..." : "🗑️ Eliminar Álbum"}
    </button>
  );
}
