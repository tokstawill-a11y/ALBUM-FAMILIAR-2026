import Link from 'next/link';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="page-center" style={{ flexDirection: "column", gap: "1.25rem", padding: "4rem 2rem" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "3rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 className="title-gradient" style={{ fontSize: "2.5rem" }}>Bienvenido de vuelta</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Ingresa a tu Álbum Familiar</p>
        </div>
        
        <LoginForm />
        
        <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          ¿Tu familia aún no tiene un Álbum? <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Créalos aquí</Link>
        </p>

        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem" }}>
          <Link href="/forgot-password" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>

      {/* Contact email - outside the card, always visible */}
      <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        ¿Tienes dudas o problemas?{" "}
        <a
          href="mailto:cristian.isa@gmail.com"
          style={{ color: "var(--secondary)", fontWeight: 600, textDecoration: "underline" }}
        >
          cristian.isa@gmail.com
        </a>
      </p>
    </div>
  );
}

