import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { logoutAction } from '@/actions/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId as string }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="glass-panel" style={{ position: "sticky", top: 0, zIndex: 10, borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "80px" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h2 className="title-gradient" style={{ margin: 0, fontSize: "1.5rem" }}>
              {family?.name || "Álbum Familiar"}
            </h2>
          </Link>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>Hola, {session.user.name}</span>
            <form action={logoutAction}>
              <button type="submit" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      
      <main style={{ flex: 1, padding: "2rem 0", backgroundColor: "var(--surface-hover)" }}>
        {children}
      </main>
    </div>
  );
}
