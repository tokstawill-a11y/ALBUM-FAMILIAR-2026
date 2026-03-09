"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addCommentAction(prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "No autorizado" }

  const text = formData.get("text") as string
  const mediaId = formData.get("mediaId") as string

  if (!text || text.trim() === "") return { error: "El comentario no puede estar vacío" }

  try {
    await prisma.comment.create({
      data: {
        text,
        mediaId,
        authorId: session.user.id
      }
    })

    revalidatePath(`/dashboard/media/${mediaId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Error al publicar el comentario" }
  }
}
