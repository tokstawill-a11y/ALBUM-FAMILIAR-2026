"use client";

import { useState } from "react";
import { deleteMediaAction } from "@/actions/media";
import { useRouter } from "next/navigation";

export default function DeleteMediaButton({ mediaId, albumId }: { mediaId: string; albumId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("¿Estás seguro de que quieres eliminar este recuerdo?")) {
      return;
    }

    setIsDeleting(true);
    const res = await deleteMediaAction(mediaId);
    if (res?.error) {
      alert(res.error);
      setIsDeleting(false);
    } else {
      router.push(`/dashboard/albums/${albumId}`);
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
        padding: "0.5rem 1rem",
        borderRadius: "var(--radius-md)",
        fontWeight: 600,
        cursor: isDeleting ? "not-allowed" : "pointer",
        transition: "var(--transition)",
        fontSize: "0.9rem"
      }}
      onMouseOver={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
      onMouseOut={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
    >
      {isDeleting ? "Eliminando..." : "🗑️ Eliminar"}
    </button>
  );
}
