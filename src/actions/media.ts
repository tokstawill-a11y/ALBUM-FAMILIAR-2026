"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { uploadToDrive, deleteFromDrive, getDrivePublicUrl } from "@/lib/drive"
import path from "path"

export async function uploadMediaAction(albumId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "No autorizado" }

  const file = formData.get("file") as File
  if (!file || file.size === 0) return { error: "No se seleccionó ningún archivo" }

  const isImage = file.type.startsWith("image/")
  const isVideo = file.type.startsWith("video/")
  
  if (!isImage && !isVideo) {
    return { error: "Formato no soportado" }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = path.extname(file.name) || (isImage ? ".jpg" : ".mp4")
    
    // Upload to Google Drive
    const driveFile = await uploadToDrive(buffer, file.name, file.type)
    const driveUrl = getDrivePublicUrl(driveFile.id!)

    await prisma.media.create({
      data: {
        url: driveUrl,
        providerId: driveFile.id,
        type: isImage ? "IMAGE" : "VIDEO",
        albumId,
        uploadedById: session.user.id
      }
    })

    revalidatePath(`/dashboard/albums/${albumId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Error al subir el archivo" }
  }
}

export async function importFromUrlAction(albumId: string, url: string) {
  const session = await auth()
  if (!session?.user) return { error: "No autorizado" }

  if (!url || !url.startsWith("http")) return { error: "URL inválida" }

  // Simple type detection based on extension
  const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/)
  
  try {
    await prisma.media.create({
      data: {
        url,
        type: isVideo ? "VIDEO" : "IMAGE",
        albumId,
        uploadedById: session.user.id
      }
    })

    revalidatePath(`/dashboard/albums/${albumId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Error al importar desde URL" }
  }
}

export async function deleteMediaAction(mediaId: string) {
  const session = await auth()
  if (!session?.user) return { error: "No autorizado" }

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: { album: true }
  })

  if (!media) return { error: "No se encontró el archivo" }

  const isUploader = media.uploadedById === session.user.id
  const isAlbumOwner = media.album.createdById === session.user.id

  if (!isUploader && !isAlbumOwner) {
    return { error: "No tienes permiso para eliminar este archivo" }
  }

  try {
    // Delete from Google Drive if it was stored there
    if (media.providerId) {
      try {
        await deleteFromDrive(media.providerId)
      } catch (driveError) {
        console.error("Error deleting from Drive:", driveError)
        // We continue deleting from DB even if Drive fails (maybe it was deleted manually)
      }
    }
    
    await prisma.media.delete({
      where: { id: mediaId }
    })

    revalidatePath(`/dashboard/albums/${media.albumId}`)
    revalidatePath(`/dashboard`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Error al eliminar el archivo" }
  }
}


