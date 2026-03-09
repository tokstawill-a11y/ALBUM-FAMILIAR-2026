import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="page-center">
      <div className="container" style={{ textAlign: "center", maxWidth: "800px" }}>
        <h1 className="title-gradient" style={{ fontSize: "4rem", marginBottom: "1rem" }}>
          Tus recuerdos de familia, <br/>en un solo lugar
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.25rem", marginBottom: "3rem" }}>
          Álbum Familiar es el espacio privado, seguro e intuitivo para que tú y tu familia compartan fotos y videos. 
          Diseñado para conectar a todas las generaciones.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" className="btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
            Crear Álbum Familiar
          </Link>
          <Link href="/login" className="btn-secondary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
            Iniciar Sesión
          </Link>
        </div>
        
        <div style={{ marginTop: "5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem", textAlign: "left" }}>
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--primary)", fontSize: "1.5rem" }}>Privado y Seguro</h3>
            <p style={{ color: "var(--text-muted)" }}>Solo los miembros de tu familia que invites tendrán acceso a los recuerdos compartidos. Tu privacidad es lo primero.</p>
          </div>
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--secondary)", fontSize: "1.5rem" }}>Fácil de Usar</h3>
            <p style={{ color: "var(--text-muted)" }}>Una interfaz moderna pensada para que abuelos, padres y nietos puedan participar sin complicaciones técnicas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
