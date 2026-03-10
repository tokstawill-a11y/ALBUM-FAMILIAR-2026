"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/dashboard",
    })
    return { error: null }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales inválidas." }
        default:
          return { error: "Error al iniciar sesión." }
      }
    }
    throw error
  }
}

export async function registerFamilyAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const familyName = formData.get("familyName") as string
  
  if (!email || !password || !name || !familyName) {
    return { error: "Todos los campos son requeridos." }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "El correo ya está registrado." }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.$transaction(async (tx) => {
    const family = await tx.family.create({
      data: { name: familyName }
    })
    
    return await tx.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        familyId: family.id,
        role: "ADMIN"
      }
    })
  })

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  })
  
  return { error: null }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" })
}

import { sendPasswordResetEmail } from "@/lib/mail"
import { randomBytes } from "crypto"

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string

  if (!email) return { error: "El correo es requerido." }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Return success even if user not found for security reasons
    return { success: "Si el correo está registrado, recibirás un enlace de recuperación." }
  }

  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

  await prisma.passwordResetToken.upsert({
    where: { email_token: { email, token } },
    update: { token, expires },
    create: { email, token, expires }
  })

  const mailRes = await sendPasswordResetEmail(email, token)
  if (mailRes.error) return { error: mailRes.error }

  return { success: "Si el correo está registrado, recibirás un enlace de recuperación." }
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string

  if (!token || !password) return { error: "Token y contraseña son requeridos." }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken || resetToken.expires < new Date()) {
    return { error: "El enlace ha expirado o es inválido." }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.$transaction([
    prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    }),
    prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    })
  ])

  return { success: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." }
}
