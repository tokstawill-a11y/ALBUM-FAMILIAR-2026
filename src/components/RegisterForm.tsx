"use client";
import { useActionState } from "react";
import { registerFamilyAction } from "@/actions/auth";

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerFamilyAction, null);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {state?.error && (
        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--error)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
          {state.error}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="familyName" style={{ fontWeight: 500 }}>Nombre de la Familia</label>
        <input type="text" id="familyName" name="familyName" required placeholder="Ej. Familia González" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="name" style={{ fontWeight: 500 }}>Tu Nombre</label>
        <input type="text" id="name" name="name" required placeholder="Juan González" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="email" style={{ fontWeight: 500 }}>Correo Electrónico</label>
        <input type="email" id="email" name="email" required placeholder="juan@correo.com" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="password" style={{ fontWeight: 500 }}>Contraseña</label>
        <input type="password" id="password" name="password" required placeholder="••••••••" minLength={6} />
      </div>
      <button type="submit" className="btn-primary" style={{ marginTop: "1rem", width: "100%" }} disabled={isPending}>
        {isPending ? "Creando Álbum..." : "Crear Álbum Familiar"}
      </button>
    </form>
  )
}
