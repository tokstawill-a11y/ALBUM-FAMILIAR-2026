import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="page-center" style={{ flexDirection: "column", gap: "1.25rem", padding: "4rem 2rem" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "500px", padding: "3rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 className="title-gradient" style={{ fontSize: "2.5rem" }}>Comienza tu Álbum</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Crea un espacio privado para tu familia</p>
        </div>
        
        <RegisterForm />
        
        <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-muted)" }}>
          ¿Ya tienes una cuenta o fuiste invitado? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Inicia Sesión</Link>
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

