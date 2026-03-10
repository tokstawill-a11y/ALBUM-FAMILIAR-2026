"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/actions/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState(forgotPasswordAction, null);

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "var(--background)",
      padding: "20px"
    }}>
      <div className="glass-panel" style={{ 
        maxWidth: "450px", 
        width: "100%", 
        padding: "3rem",
        textAlign: "center"
      }}>
        <h1 className="title-gradient" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          Recuperar acceso
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form action={action} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
              Correo Electrónico
            </label>
            <input 
              name="email"
              type="email" 
              required
              placeholder="tu@email.com"
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "white"
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="btn-primary"
            style={{ width: "100%", padding: "1rem", marginBottom: "1.5rem" }}
          >
            {isPending ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>

        {state?.error && (
          <div style={{ color: "#ef4444", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            ⚠️ {state.error}
          </div>
        )}

        {state?.success && (
          <div style={{ color: "#10b981", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            ✅ {state.success}
          </div>
        )}

        <div style={{ fontSize: "0.9rem" }}>
          <Link href="/login" style={{ color: "var(--primary)", textDecoration: "none" }}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
