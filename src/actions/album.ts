"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function createAlbumAction(prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "No autorizado" }

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!title) return { error: "El título es requerido" }

  const album = await prisma.album.create({
    data: {
      title,
      description,
      familyId: session.user.familyId as string,
      createdById: session.user.id
    }
  })

  redirect(`/dashboard/albums/${album.id}`)
}

export async function deleteAlbumAction(albumId: string) {
  const session = await auth()
  if (!session?.user) return { error: "No autorizado" }

  const album = await prisma.album.findUnique({
    where: { id: albumId }
  })

  if (!album || album.createdById !== session.user.id) {
    return { error: "No tienes permiso para eliminar este álbum" }
  }

  await prisma.album.delete({
    where: { id: albumId }
  })

  redirect("/dashboard")
}

