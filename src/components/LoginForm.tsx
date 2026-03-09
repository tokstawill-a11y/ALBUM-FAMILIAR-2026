"use client";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {state?.error && (
        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--error)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
          {state.error}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="email" style={{ fontWeight: 500 }}>Correo Electrónico</label>
        <input type="email" id="email" name="email" required placeholder="tu@correo.com" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label htmlFor="password" style={{ fontWeight: 500 }}>Contraseña</label>
        <input type="password" id="password" name="password" required placeholder="••••••••" />
      </div>
      <button type="submit" className="btn-primary" style={{ marginTop: "1rem", width: "100%" }} disabled={isPending}>
        {isPending ? "Iniciando..." : "Iniciar Sesión"}
      </button>
    </form>
  )
}
