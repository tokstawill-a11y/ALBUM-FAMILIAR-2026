import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Álbum Familiar",
  description: "Una aplicación para organizar, compartir y preservar recuerdos familiares.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <main className="main-content" style={{ flex: 1 }}>
          {children}
        </main>
        <footer style={{
          textAlign: "center",
          padding: "1rem 1.5rem",
          borderTop: "1px solid var(--border)",
          background: "var(--surface)",
          color: "var(--text-muted)",
          fontSize: "0.825rem",
        }}>
          Creado y Desarrollado por <strong style={{ color: "var(--primary)" }}>Pelao Isa</strong> para la familia
          &nbsp;·&nbsp; © Derechos reservados 2026
        </footer>
      </body>
    </html>
  );
}
