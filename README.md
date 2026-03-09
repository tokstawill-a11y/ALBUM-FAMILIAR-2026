# Álbum Familiar

Álbum Familiar es una aplicación web moderna diseñada para que familias de todas partes del mundo puedan organizar, compartir y preservar sus recuerdos (fotos y videos) en un espacio digital privado y seguro.

## Características Principales
- **Multiusuario y Roles:** Creación de familias completas, donde cada integrante puede tener su cuenta.
- **Gestión de Álbumes:** Creación de álbumes personalizados para agrupar recuerdos de eventos especiales (vacaciones, cumpleaños, etc.).
- **Subida de Archivos:** Comparte fotos y videos fácilmente.
- **Interacción Social Privada:** Sistema completo de comentarios en cada foto o video.
- **Diseño Premium y Accesible:** Interfaz moderna (Vanilla CSS, Glassmorphism, Responsive) amigable para todas las edades, desde abuelos hasta nietos.
- **Privacidad y Seguridad:** Autenticación robusta y aislamiento de datos por familia.

## Tecnologías y Stack
- **Frontend y Backend:** Next.js 15 (App Router, Server Actions)
- **Base de Datos:** Prisma ORM + SQLite (fácilmente escalable a PostgreSQL en producción cambiando la configuración)
- **Autenticación:** NextAuth.js (Auth.js v5)
- **Diseño:** Vanilla CSS puro con custom properties, sin frameworks restrictivos, priorizando el rendimiento y la personalización.
- **Lenguaje:** TypeScript estricto.

## Estructura de Proyecto
```
/src
  /actions     # Server Actions (auth, media, álbumes, comentarios)
  /app         # Next.js App Router (páginas públicas y dashboard privado)
  /components  # Componentes reutilizables e interactivos de UI (Cliente)
  /lib         # Utilidades generales (Instancia de Prisma)
  /styles      # Sistema de diseño central (no usado en layout si es global, pero disponible)
  /types       # Definiciones de TypeScript customizadas
/prisma        # Esquema de la base de datos (schema.prisma)
/public        # Archivos estáticos y directorio temporal de uploads (MVP local)
```

## Configuración y Ejecución Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar Base de Datos local:**
   El proyecto utiliza SQLite por defecto durante desarrollo para facilitar las pruebas.
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Variables de Entorno:**
   Revisa el archivo `.env` asegurándote de tener:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="cualquier-texto-largo-aleatorio"
   ```

4. **Correr el Proyecto:**
   ```bash
   npm run build
   npm start
   # o para desarrollo interactivo: npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000).

## Recomendaciones de Evolución Futura
Para un despliegue en producción real, se recomienda:
1. Cambiar la `DATABASE_URL` en el `.env` para apuntar a un servidor **PostgreSQL** (ej: Supabase, Neon).
2. Cambiar la estrategia de subida de archivos (mockeada local en `public/uploads`) por una integración S3 u otro proveedor en la nube como Cloudinary o AWS, modificando `src/actions/media.ts`.
3. Agregar recuperación de contraseñas por correo usando un servicio SMTP y NextAuth.
