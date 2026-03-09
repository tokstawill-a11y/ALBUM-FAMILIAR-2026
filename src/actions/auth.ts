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
