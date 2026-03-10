"use client";

import { useActionState, Suspense } from "react";
import { resetPasswordAction } from "@/actions/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, action, isPending] = useActionState(resetPasswordAction, null);

  return (
    <div className="glass-panel" style={{ 
      maxWidth: "450px", 
      width: "100%", 
      padding: "3rem",
      textAlign: "center"
    }}>
      <h1 className="title-gradient" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        Nueva contraseña
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        Ingresa tu nueva contraseña para recuperar el acceso a tu álbum.
      </p>

      {!token ? (
        <div style={{ color: "#ef4444", marginBottom: "1.5rem" }}>
          ⚠️ El enlace de recuperación es inválido o falta el token.
        </div>
      ) : (
        <form action={action} style={{ textAlign: "left" }}>
          <input type="hidden" name="token" value={token} />
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
              Nueva Contraseña
            </label>
            <input 
              name="password"
              type="password" 
              required
              placeholder="••••••••"
              minLength={8}
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
            {isPending ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      )}

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
          Ir al inicio de sesión
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "var(--background)",
      padding: "20px"
    }}>
      <Suspense fallback={<div className="glass-panel">Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
