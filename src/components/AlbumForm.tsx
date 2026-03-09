"use client";

import { useActionState } from "react";
import { createAlbumAction } from "@/actions/album";

export default function AlbumForm() {
  const [state, formAction, isPending] = useActionState(createAlbumAction, null);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {state?.error && (
        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--error)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
          {state.error}
        </div>
      )}
      
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="title" style={{ fontWeight: 500 }}>Título del Álbum</label>
        <input type="text" id="title" name="title" required placeholder="Ej. Vacaciones 2026" />
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="description" style={{ fontWeight: 500 }}>Descripción (Opcional)</label>
        <textarea id="description" name="description" rows={3} placeholder="Un breve recuerdo sobre este momento..." />
      </div>
      
      <button type="submit" className="btn-primary" style={{ marginTop: "1rem", alignSelf: "flex-start" }} disabled={isPending}>
        {isPending ? "Creando..." : "Crear Álbum"}
      </button>
    </form>
  )
}
